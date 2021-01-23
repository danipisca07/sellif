require('dotenv').config();
const axios = require('axios');
//https://min-api.cryptocompare.com/data/v2/histohour
    //?fsym=BTC
    //&tsym=USD
    //&limit=24
    //&aggregate=1
    //&toTs=1452680400
    //&api_key=API_KEY
const API_KEY = process.env.CRYPTOCOMPARE_KEY;
const url = 'https://min-api.cryptocompare.com/data/v2/histohour';

/*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*           THIS IS CURRENTLY BUGGED! TIME IS NOT SYNCHED FOR SOME REASON, DONT USE!
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*/
class CryptoComparePriceHistory {
    constructor(logger, from, to, timeFrom=null, limit=100){
        this.logger = logger;
        this.from = from;
        this.to = to;
        this.data = [];
        this.limit = limit;
        this.timeFrom = null;
        if(timeFrom!=null){
            this.timeFrom = CryptoComparePriceHistory.roundToMultiple(timeFrom);
            this.timeFrom +=this.limit*60*60;
        }
        this.promise = this.updateData();
    }

    async updateData(){
        return new Promise(async (resolve, reject) => {
            try {
                let req = url;
                req += `?fsym=${this.from}&tsym=${this.to}`;
                req += `&limit=${this.limit}`;
                if(this.timeFrom != null)
                    req += "&toTs=" +this.timeFrom;
                req += `&api_key=${API_KEY}`;
                const resp = await axios.get(req);
                let res = resp.data.Data;
                this.timeFrom=res.TimeTo+((this.limit+1)*60*60);
                this.data = res.Data;
                resolve();
                
            } catch(err){
                this.logger.log(err)
                reject(err);
            }
        });
    }

    async getPriceAndTime(){
        return new Promise(async (resolve, reject) => {
            if(this.data.length == 0){
                await this.promise;
            }
            let t = this.data.shift();
            resolve({price: t.close, time: t.time});
            if(this.data.length == 0){
                this.promise = this.updateData();
            }
        });
    }

    static getTimestamp(date=null){
        let timestamp;
        if(!date)
            timestamp = new Date().getTime() / 1000;
        else{
            if(!date.year || !date.month || !date.day){
                throw new Error("Date not correct");
            }
            if(!date.hours)
                date.hours = 0;
            if(!date.minutes)
                date.minutes = 0;
            timestamp = new Date(date.year, date.month, date.day, date.hours, date.minutes).getTime() / 1000;
        }
        return CryptoComparePriceHistory.roundToMultiple(timestamp);
    }

    static roundToMultiple(x){
        return Math.floor(x/3600)*3600;
    }


}

module.exports = CryptoComparePriceHistory;