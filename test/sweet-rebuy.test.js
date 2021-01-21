require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)

const SweetRebuy = require('../sweet-rebuy.js');



describe('Mock Api', function() {
    this.timeout(5000);
    it('should run', async function() {
        let tmp = [];
        let logger = { info: (s) => {tmp.push(s)} };
        let s = new SweetRebuy(logger);
        s.run();
        await new Promise(r => setTimeout(r, 3000));
        expect(tmp.length).to.be.greaterThan(0);
        s.stop();
    })
})