const SweetRebuy = require('./sweet-rebuy');
const Api = require('./mock-api');

let start = new Date(2018, 6, 1);
let trail = 1000;
let fee = 0.1 / 100;
let balances = {
    BTC: 1,
    USD: 0
};
let mocklog = { info: () => {} };
let api = new Api(mocklog, start, balances, fee);
let strat = new SweetRebuy(console, api, trail, fee);

strat.run();
