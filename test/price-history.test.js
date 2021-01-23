require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)

// const PriceHistory = require('../price-history/csv.js');
//const PriceHistory = require('../price-history/cryptocompare.js');
// const PriceHistory = require('../price-history/cryptowatcher.js');
const PriceHistory = require('../price-history/coinapi.js');

describe('PriceHistory', function() {
    this.timeout(60000);
    it('should return same time', async function() {
        var start = new Date(2018, 1, 1);
        let ph = new PriceHistory(console, "BTC", "USDT", start, 10);
        let step = PriceHistory.getStep();
        for(let i=0; i<5; i++){
            let date = new Date(2018, 1, 1+step.day*i, 0+step.hour*i, 0+step.minute*i);
            let t = await ph.getPriceAndTime();
            expect(t.time.getTime()).to.be.equal(date.getTime());
        }
    })
    // it('should be synchronized', async function() {
    //     var start = null;
    //     let ph = new PriceHistory(console, "BTC", "USD", null, 1);
    //     let t = await ph.getPriceAndTime();
    //     expect(t.time).to.be.equal(start);
    // })
    it('Should return price', async function() {
        var start = new Date(2018, 1, 1);
        let ph = new PriceHistory(console, "BTC", "USDT", start, 20);
        let res = [];
        for(let i = 0; i<10; i++){
            res.push(await ph.getPriceAndTime());
        }
        expect(res).to.be.an('array');
    })
    it('Should return very old price', async function() {
        var start = new Date(2016, 1, 1);
        let ph = new PriceHistory(console, "BTC", "USDT", start, 20);
        let res = [];
        for(let i = 0; i<40; i++){
            res.push(await ph.getPriceAndTime());
        }
        expect(res).to.be.an('array');
    })
})
