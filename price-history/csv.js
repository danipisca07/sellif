require('dotenv').config();
const csv = require('csv-parser');
const NoData = require('../Exceptions/NoData');
const fs = require('fs');
//https://min-api.cryptocompare.com/data/v2/histohour
    //?fsym=BTC
    //&tsym=USD
    //&limit=24
    //&aggregate=1
    //&toTs=1452680400
    //&api_key=API_KEY
const API_KEY = process.env.API_KEY;
const url = 'https://min-api.cryptocompare.com/data/v2/histohour';

class CsvPriceHistory {
    constructor(logger, from, to, timeFrom=null, limit=100){
        this.logger = logger;
        this.from = from;
        this.to = to;
        this.data = [];
        this.limit = limit;
        this.timeFrom = CsvPriceHistory.getTimestamp(timeFrom);
        this.started = false;
        this.done = false;
        this.promise = new Promise(r => setTimeout(r, 500));
        fs.createReadStream('./price-history/btc-history.csv')
            .pipe(csv())
                .on('data', (row) => {
                    if(!this.started && row.Date === this.timeFrom)
                        this.started = true;
                    if(this.started)
                        this.data.push(row);
                })
                .on('end', () => {
                    this.done = true;
                });
    }

    async getPrice(){
        return new Promise(async (resolve, reject) => {
            try {
                let t = await this.getPriceAndTime();
                resolve(t.price);
            }catch(err){
                reject(err);
            }            
        });
    }

    async getPriceAndTime(){
        return new Promise(async (resolve, reject) => {
            while(this.data.length == 0){
                if(this.done)
                    reject(new NoData('No more data'));
                await new Promise(r => setTimeout(r, 500));
            }
            let t = this.data.shift();
            let price = parseFloat(t['Closing Price (USD)']);
            let time = t.Date;
            resolve({price,time});
        });
    }

    //2013-10-01
    static getTimestamp(date=null){
        if(!date){
            date = new Date();
        }
        let timestamp = {};
        timestamp.year = date.getFullYear();
        timestamp.month = date.getMonth();
        timestamp.day = date.getDate();
        return `${timestamp.year}-`+("00"+timestamp.month).slice(-2)+"-"+("00"+timestamp.day).slice(-2);
    }
}

module.exports = CsvPriceHistory;