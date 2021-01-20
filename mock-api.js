const PriceHistory = require('./price-history/csv');
const _ = require('lodash');
class MockApi {
    constructor(logger, timeFrom, startingBalances){
        this.logger = logger;
        this.api = new PriceHistory(console, "BTC", "USD", timeFrom, 100);
        this.balances = startingBalances;
        this.balanceHistory = [_.clone(startingBalances)];
        this.trades = 0;
    }

    async getCurrentPrice(){
        return this.api.getPrice();
    }

    async trade(typeSold, typeBought, quantity, price){
        return new Promise((resolve, reject) => {
            let balancesOld = _.clone(this.balances);
            try {
                if(!this.balances[typeSold] || this.balances[typeSold]<quantity)
                    throw new Error("Quantity higher than balance.");
                this.balances[typeSold] -= quantity;
                if(!this.balances[typeBought])
                    this.balances[typeBought] = 0;
                this.balances[typeBought] += quantity*price;
                this.logger.info(`${this.trades++}- Sold ${quantity} ${typeSold} at ${price} ${typeBought} [${JSON.stringify(this.balances)}]`);
                this.balanceHistory.push(_.clone(this.balances));
            }catch (err){
                this.balances = balancesOld;
                reject(err);
            }
            resolve();
        });
    }

    async getBalances(){
        return new Promise((res, rej) => res(this.balances));
    }
}

module.exports = MockApi;