require('newrelic');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const trending = require('./routes/trending');
var faker = require('faker');


const app = new Koa();
const PORT = process.env.PORT || 1337;

// let redis = require('redis');
// let client = redis.createClient(3000, {no_ready_check: true});

// client.auth((err) => {
// 	if (err) throw err;
// });

// client.on('connect', () => {
// 	console.log('Connected to Redis');
// });


app.use(bodyParser());
app.use(trending.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;