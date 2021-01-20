require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)

const PriceHistory = require('../price-history/csv.js');
let step = { day: 1, hour: 0, minute: 0};
//const PriceHistory = require('../price-history/cryptocompare.js');
// let step = { day: 0, hours: 1, minute: 0};

describe('PriceHistory', function() {
    this.timeout(5000);
    it('should return same time', async function() {
        var start = {year: 2018, month: 1, day: 1};
        let ph = new PriceHistory(console, "BTC", "USD", start, 1);
        for(let i=0; i<5; i++){
            let next = PriceHistory.getTimestamp({year: 2018, month: 1, day: 1+step.day*i, hours: 0+step.hour*i});
            let t = await ph.getPriceAndTime();
            expect(t.time).to.be.equal(next);
        }
    })
    // it('should be synchronized', async function() {
    //     var start = null;
    //     let ph = new PriceHistory(console, "BTC", "USD", null, 1);
    //     let t = await ph.getPriceAndTime();
    //     expect(t.time).to.be.equal(start);
    // })
    it('Should return price', async function() {
        var start = {year: 2018, month: 1, day: 1};
        let ph = new PriceHistory(console, "BTC", "USD", start, 2);
        let prices = [];
        for(let i = 0; i<10; i++){
            prices.push(await ph.getPrice());
        }
        expect(prices).to.be.an('array');
    })
})
