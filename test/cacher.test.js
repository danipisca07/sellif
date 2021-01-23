require('dotenv').config()
const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(require('chai-as-promised'));
chai.use(sinonChai)
const fs = require('fs');

const Cacher = require('../api/cacher.js');
describe('Cacher', function() {
    it('should parse correctly', function() {
        const tests = [
            [ "http://test/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test/path/string/test=2&re&re.json" ],
            [ "https://test/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test/path/string/test=2&re&re.json" ],
            [ "test/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test/path/string/test=2&re&re.json" ],
            [ "http://test/path/string/" , Cacher.CACHE_FOLDER+"test/path/string.json" ],
        ];
        tests.forEach((t) =>{
            expect(Cacher.getPath(t[0])).to.be.equal(t[1]);
        });
    })
    it('should get not cached and cache it', async function() {
        const url = "http://api.cryptowat.ch/markets/kraken/btceur/ohlc";
        let res = await Cacher.get(url);
        expect(res.data).to.be.an('object');
        let path = Cacher.getPath(url);
        expect(fs.existsSync(path)).to.be.true;
    })
    it('should use cached', function() {
        const tests = [
            [ Cacher.getPath("https://api.cryptowat.ch/markets/kraken/btceur/ohlc") , true ],
            [ Cacher.getPath("https://api.cryptowat.ch/markets/kraken/btceur/ohlc?test=1") , false ],
        ];
        tests.forEach((t) =>{
            expect(Cacher.cached(t[0])).to.be.equal(t[1]);
        });
    })
    it('should get cached', async function() {
        const tests = [
            "https://api.cryptowat.ch/markets/kraken/btceur/ohlc",
        ];
        tests.forEach(async (t) =>{
            let res = await Cacher.get(t);
            expect(res.data).to.be.an('object');
        });
    })
})
