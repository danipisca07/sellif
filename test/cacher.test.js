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
            [ "http://test1/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test1/path/string/test=2&re&re.json" ],
            [ "https://test2/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test2/path/string/test=2&re&re.json" ],
            [ "test3/path/string?test=2&re&re" , Cacher.CACHE_FOLDER+"test3/path/string/test=2&re&re.json" ],
            [ "http://test4/path/string/" , Cacher.CACHE_FOLDER+"test4/path/string.json" ],
            [ "http://test5/path/string?test=2:2&api_key=2wqe2e" , Cacher.CACHE_FOLDER+"test5/path/string/test=22.json" ],
            [ "http://test6/path/string?api_key=2wqe2e&test=qwe" , Cacher.CACHE_FOLDER+"test6/path/string/test=qwe.json" ],
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
