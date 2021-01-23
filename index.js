const SweetRebuy = require('./traders/sweet-rebuy');
const Api = require('./api/mock-api');
const PriceHistory = require('./price-history/coinapi');

let start = new Date(2018, 6, 1);
let trail = 500;
let fee = 0.1 / 100;
let balances = {
    BTC: 1,
    USD: 0
};
let mocklog = { info: () => {} };

let interval = setInterval(() => {
    let data = api.api.data;
    if(data.length > 0){  
        console.log("Current:" + JSON.stringify(data[0]));
        console.log("__________");
    } else
        console.log("No data");

}, 20000);

let whenDone = async () => {
    clearInterval(interval);
    let balances = await api.getBalances();
    console.info("Finished with:" + JSON.stringify(balances));
    process.exit(0);
}

let priceHistory = new PriceHistory(console, 'BTC', 'USD', start, 100);
let api = new Api(mocklog, priceHistory, balances, fee);
let strat = new SweetRebuy(console, api, trail, fee, whenDone);

strat.run();
