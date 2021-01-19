require('dotenv').config();
const axios = require('axios');
//https://min-api.cryptocompare.com/data/v2/histohour
    //?fsym=BTC
    //&tsym=USD
    //&limit=24
    //&aggregate=1
    //&toTs=1452680400
    //&api_key=API_KEY
const API_KEY = process.env.API_KEY;
const url = 'https://min-api.cryptocompare.com/data/v2/histohour';

class PriceHistory {
    constructor(logger, from, to, timeFrom=null, limit=100){
        this.logger = logger;
        this.from = from;
        this.to = to;
        this.data = [];
        this.limit = limit;
        this.timeFrom = null;
        if(timeFrom!=null){
            this.timeFrom = this.roundToMultiple(timeFrom);
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

    async getPrice(){
        return new Promise(async (resolve, reject) => {
            if(this.data.length == 0){
                await this.promise;
            }
            resolve(this.data.shift().close);
            if(this.data.length == 0){
                this.promise = this.updateData();
            }
        });
    }

    roundToMultiple(x){
        return Math.ceil(x/3600)*3600;
    }
}

module.exports = PriceHistory;