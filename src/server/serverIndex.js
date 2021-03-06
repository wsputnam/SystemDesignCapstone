require('newrelic');

const statsD = require('node-statsd');
const statsDClient = new statsD({
    host: 'statsd.hostedgraphite.com',
    port: 8125,
    // prefix: statsDConfig.API
    prefix: process.env.HOSTEDGRAPHITE_APIKEY
});


const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const trending = require('./routes/trending');
var faker = require('faker');


const app = new Koa();
const PORT = process.env.PORT || 1337;



app.use(bodyParser());
app.use(trending.routes());

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;