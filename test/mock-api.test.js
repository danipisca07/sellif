require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)

const Api = require('../mock-api.js');
let startBalances = {
    BTC: 2,
    USD: 0
}
let start = new Date(2018, 6, 1);
let logger = { info: () => {} };
describe('Mock Api', function() {
    this.timeout(5000);
    let api;
    beforeEach(()=>{
        api = new Api(logger, start, startBalances);
    })
    it('should set balances', async function() {
        expect(api.balanceHistory[0].BTC).to.be.equal(2);
        await api.trade('BTC', 'USD', 1, 10000);
        let b = await api.getBalances();
        expect(b.BTC).to.be.equal(1);
        expect(b.USD).to.be.equal(10000);
        expect(api.balanceHistory[1].BTC).to.be.equal(1);
        await api.trade('BTC', 'USD', 1, 10000);
        b = await api.getBalances();
        expect(b.BTC).to.be.equal(0);
        expect(b.USD).to.be.equal(20000);
        expect(api.balanceHistory[2].BTC).to.be.equal(0);
    })
})
