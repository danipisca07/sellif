const TIME_BETWEEN_UPDATES = 1000;
const STAGES = Object.freeze({
    INITIAL: 'initial',
    SOLD: 'sold',
    IN_GAIN: 'in_gain'
});

class sweetRebuy {
    constructor(logger, api, trail, fee) {
        this.logger = logger;
        this.api = api;
        this.traded = 'BTC';
        this.baseCurrency = 'USD';
        this.quantityTraded = 1;
        this.fiatQuantity = 0;
        this.trail = trail;
        this.stage = STAGES.INITIAL;
        this.fee = fee;
        this.historyPrice = [];
    }
    async run() {
        let currentPrice = await this.api.getCurrentPrice();
        this.logger.info(`Initial price: ${currentPrice}`);
        this.stopLoss = currentPrice-this.trail;
        this.logger.info(`Initial stop loss set to: ${this.stopLoss}`);
        this.interval = setInterval((() => {
            this.check();
        }).bind(this), TIME_BETWEEN_UPDATES);
    }
    async check() {
        let currentPrice = await this.api.getCurrentPrice(this.traded);
        this.historyPrice.push(currentPrice);
        if(this.historyPrice.length > 50) this.historyPrice.shift();
        if (this.condition(currentPrice)) {
            let tradeok = await this.trade(currentPrice);
            //TODO: Check trade condition
            this.changeStage(currentPrice);
            this.logger.info("__________");
        }
    }

    condition(price) {
        if (this.stage === STAGES.INITIAL) {
            return price < this.stopLoss;
        } else if (this.stage === STAGES.SOLD) {
            if (price > this.fomo) {
                return true;
            } else {
                if (price < this.reenter) {
                    return true;
                } else {
                    return false;
                }
            }
        } else if (this.stage === STAGES.IN_GAIN) {
            if(price > this.reenter){
                return true;
            } else {
                if(this.reenter > price-this.trail)
                    this.reenter = price-this.trail;
                return false;
            }
        }
    }

    changeStage(price){
        if(this.stage === STAGES.INITIAL){
            this.stage = STAGES.SOLD;
            this.reenter = this.getPriceToRebuyEven(price, this.fee);
            this.fomo = this.getPriceFomo(price, this.reenter);
            this.lastTradePrice = price;
            this.logger.info(`Change stage to SOLD. Fomo at: ${this.fomo} Break-even at: ${this.reenter}`);
        } else if(this.stage === STAGES.SOLD){
            if(price > this.fomo){
                this.stage = STAGES.INITIAL;
                this.stopLoss = price-this.trail;
                this.logger.info(`Change stage to INITIAL. stopLoss at ${this.stopLoss}`);
            } else if (price < this.reenter) {
                this.stage = STAGES.IN_GAIN;
                this.reenter = price-this.trail;
                this.logger.info(`Change stage to IN_GAIN. Re-enter at: ${this.reenter}`);
            }
        } else if(this.stage === STAGES.IN_GAIN){
            this.stage = STAGES.INITIAL;
            this.stopLoss = price-this.trail;
            this.logger.info(`Change stage to INITIAL. stopLoss at: ${this.stopLoss}`);
        }
    }

    async trade(price) {
        return new Promise(async (res) => {
            if(this.stage === STAGES.INITIAL){
                let rec = await this.api.trade(this.traded, this.baseCurrency, this.quantityTraded, price);
                this.fiatQuantity = rec;
                this.logger.info(`Sold ${this.quantityTraded} ${this.traded} at ${price}`);
                res();
            } else if(this.stage === STAGES.SOLD || this.stage === STAGES.IN_GAIN){
                let rec = await this.api.trade(this.baseCurrency, this.traded, this.fiatQuantity, 1/price);
                this.quantityTraded = rec;
                this.logger.info(`Bought ${this.quantityTraded} ${this.traded} at ${price}`);
                res();
            }
        })
    }

    stop() {
        clearInterval(this.interval);
    }

    getPriceToRebuyEven(priceOfLastSell, sellFee, buyFee) {
        if(!buyFee) buyFee = sellFee;
        let rebuyEven = priceOfLastSell * (1 - sellFee - buyFee + sellFee * buyFee);
        return rebuyEven;
    }

    getPriceFomo(priceOfLastSell, priceToRebuyEven) {
        return priceOfLastSell + (priceOfLastSell - priceToRebuyEven);
    }
}

module.exports = sweetRebuy;

function sell(price, quantity, fee) {
    return (price / quantity) * (1 - fee);
}

function buy(price, fiatQuantity, fee) {
    return (fiatQuantity / price) * (1 - fee);
}



function calculate(price, rebuyPrice, sellFee, buyFee) {
    let initialQ = 1;
    let fiat = sell(price, initialQ, sellFee);
    let finalQ = buy(rebuyPrice, fiat, buyFee);

    let loss = (initialQ - finalQ) * 100;
    if (loss < 0.0000000000001) loss = 0;
    console.log(`Sold at ${price} and rebuy at ${rebuyPrice} to lose ${loss}%`);
    return finalQ
}

// let price = 32500;
// let sellFee = 0.1 / 100;
// let buyFee = 0.1 / 100;

// let breakEven = sweets(price, sellFee, buyFee);
// let fomo = price + (price - breakEven)
// calculate(price, breakEven, sellFee, buyFee);
// calculate(price, fomo, sellFee, buyFee);




