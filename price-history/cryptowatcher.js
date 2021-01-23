require('dotenv').config();
const csv = require('csv-parser');
const NoData = require('../Exceptions/NoData');
const fs = require('fs');
//https://api.cryptowat.ch/markets/:exchange/:pair/ohlc
const CRYPTOWATCHER_URL = 'https://api.cryptowat.ch';
const CRYPTOWATCHER_PERIOD = 180; //3 minutes
const Cacher = require('../api/cacher');
const { time } = require('console');
const { reject } = require('lodash');
class CryptoWatcherPriceHistory {
    constructor(logger, from, to, timeFrom = null, limit = 100, exchange = 'binance') {
        this.logger = logger;
        this.from = from;
        this.to = to;
        this.data = [];
        this.limit = limit;
        this.timeFrom = CryptoWatcherPriceHistory.getTimestamp(timeFrom);
        this.exchange = exchange;
        this.api_key = process.env.CRYPTOWATCHER_APIKEY;
    }

    async getPrice() {
        return new Promise(async (resolve, reject) => {
            try {
                let t = await this.getPriceAndTime();
                resolve(t.price);
            } catch (err) {
                reject(err);
            }
        });
    }

    async getPriceAndTime() {
        return new Promise(async (resolve, reject) => {
            while (this.data.length == 0) {
                if (this.done)
                    reject(new NoData('No more data'));
                await this.getNextData();
            }
            let t = this.data.shift();
            let price = parseFloat(t[4]);
            let time = new Date(t[0] * 1000);
            resolve({ price, time });
        });
    }

    async getNextData() {
        return new Promise(async (resolve, reject) => {
            //https://api.cryptowat.ch/markets/:exchange/:pair/ohlc
            try {
                let pair = this.from.toLowerCase() + this.to.toLowerCase();
                let queryString = `after=${this.timeFrom}&periods=${CRYPTOWATCHER_PERIOD}`;
                //let timeTo = this.timeFrom + this.limit * CRYPTOWATCHER_PERIOD; 
                //queryString += `&before=${timeTo}`;
                queryString += `apikey=${this.api_key}`;
                let req = `${CRYPTOWATCHER_URL}/markets/${this.exchange}/${pair}/ohlc?${queryString}`;
                let res = await Cacher.get(req);
                let newData = res.data.result[CRYPTOWATCHER_PERIOD];
                this.data.push(...newData);
                resolve();
            } catch (err) {
                reject(err);
            }

        })
    }

    //2013-10-01
    static getTimestamp(date = null) {
        if (!date) {
            date = new Date();
        }
        return date.getTime() / 1000;
    }

    static getStep() {
        return { day: 0, hour: 0, minute: 1 };
    }
}

module.exports = CryptoWatcherPriceHistory;