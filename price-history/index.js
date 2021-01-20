const PriceHistory = require('./csv.js');
let date = {
    year: 2020,
    month: 1,
    day: 20
};
let start = PriceHistory.getTimestamp(date)
let ph = new PriceHistory(console, "BTC", "USD", start, 1);
(async ()=>{
    let t = await ph.getPriceAndTime();
    console.log(`Price at ${date.day}/${date.month}/${date.year}(${start}) was ${t.price}(${t.time})`);
})()
