require('dotenv').config();
const csv = require('csv-parser');
const NoData = require('../Exceptions/NoData');
const fs = require('fs');
const COINAPI_URL = 'https://rest.coinapi.io/v1/ohlcv';
const COINAPI_PERIOD = '1MIN'; 
const Cacher = require('../api/cacher');
const { time } = require('console');
const { reject } = require('lodash');
class CoinApiPriceHistory {
    constructor(logger, from, to, timeFrom=null, limit=100){
        this.logger = logger;
        this.from = from;
        this.to = to;
        this.data = [];
        this.limit = limit;
        this.timeFrom = CoinApiPriceHistory.getTimestamp(timeFrom);     
        this.api_key = process.env.COINAPI_APIKEY;
    }

    /**
     * Async 
     * @returns {Object} { price float, time Date }
     */
    async getPriceAndTime(){
        return new Promise(async (resolve, reject) => {
            while(this.data.length == 0){
                if(this.done)
                    reject(new NoData('No more data'));
                await this.getNextData();
            }
            let t = this.data.shift();
            let price = parseFloat(t['price_close']);
            let time = new Date(t['time_period_start']);
            resolve({price,time});
        });
    }

    async getNextData(){
        return new Promise(async(resolve, reject) => {
            //https://rest.coinapi.io/v1/ohlcv/BTC/USD/history?period_id=1MIN&time_start=2016-01-01T00:00:00&apikey=${APIKEY}
            try {
                let pair = this.from.toLowerCase() + this.to.toLowerCase();
                let queryString = `time_start=${this.timeFrom}&period_id=${COINAPI_PERIOD}`;
                //let timeTo = this.timeFrom + this.limit * CRYPTOWATCHER_PERIOD; 
                //queryString += `&before=${timeTo}`;
                queryString += `&apikey=${this.api_key}`;
                let req = `${COINAPI_URL}/${this.from}/${this.to}/history?${queryString}`;
                let res = await Cacher.get(req);
                let newData = res.data;
                newData.forEach(v => this.data.push(v));
                this.timeFrom = newData[newData.length-1]['time_period_end'];
                if(this.timeFrom === '2018-07-07T22:20:00.0000000Z')
                    console.log("about to break");
                //this.data.push(...newData);
                resolve();
            } catch (err){
                reject(err);
            }
            
        })
    }

    //2013-10-01
    static getTimestamp(date=null){
        if(!date){
            date = new Date();
        }
        return date.toISOString();
    }

    static getStep() {
       return { day: 0, hour: 0, minute: 1};
    }
}

module.exports = CoinApiPriceHistory;