const PriceWatcher = require('./price-watcher');
const priceWatcher = new PriceWatcher(console, 'BTCUSDT');

priceWatcher.getPrice().then((price) => {
    console.log("Current price: "+price)
});

function sell(price, quantity, fee){
    return (price/quantity) * (1-fee);
}

function buy(price, fiatQuantity, fee){
    return (fiatQuantity/price) * (1-fee); 
}

function sweets(price, sellFee, buyFee){
    let rebuyEven = price * (1-sellFee-buyFee+sellFee*buyFee);
    return rebuyEven;
}

function calculate(price, rebuyPrice, sellFee, buyFee){
    let initialQ = 1;
    let fiat = sell(price, initialQ, sellFee);    
    let finalQ = buy(rebuyPrice, fiat, buyFee);

    let loss = (initialQ-finalQ)*100;
    if(loss < 0.0000000000001) loss = 0;
    console.log(`Sold at ${price} and rebuy at ${rebuyPrice} to lose ${loss}%`);
    return finalQ
}

let price = 32500;
let sellFee = 0.1 / 100;
let buyFee = 0.1 / 100;

let breakEven = sweets(price, sellFee, buyFee);
let fomo = price + (price - breakEven)
calculate(price, breakEven, sellFee, buyFee);
calculate(price, fomo, sellFee, buyFee);




