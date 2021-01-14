const axios = require('axios');
//https://api.binance.com/api/v3/ticker/price?symbol=ETHBTC

const url = 'https://api.binance.com/api/v3/ticker/price?symbol=';

class PriceWatcher {
    constructor(logger, simbol='BTCUSDT'){
        this.logger = logger;
        this.simbol = simbol;
    }

    async getPrice(){
        try {
            const resp = await axios.get(url+this.simbol);
            return resp.data.price;
        } catch(err){
            this.logger.log(err)
        }
        
    }
}

module.exports = PriceWatcher;
