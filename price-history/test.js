require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)

const PriceHistory = require('./price-history.js');

describe('PriceHistory', function() {
    it('should be synchronized', async function() {
        var start = new Date(2018, 1, 1).getTime() / 1000;
        start = Math.ceil(start/3600)*3600;
        let ph = new PriceHistory(console, "BTC", "USD", start, 1);
        for(let i=0; i<5; i++){
            await ph.promise;
            expect(ph.data[0].time).to.be.equal(start+i*3600);
            await ph.getPrice();
        }
    })
    it('Should return price', async function() {
        var start = new Date(2018, 1, 1).getTime() / 1000;
        let ph = new PriceHistory(console, "BTC", "USD", start, 2);
        let prices = [];
        for(let i = 0; i<10; i++){
            prices.push(await ph.getPrice());
        }
        expect(prices).to.be.an('array');
    })
})
