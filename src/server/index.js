require('newrelic');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const trending = require('./routes/trending');
var faker = require('faker');


const app = new Koa();
const PORT = process.env.PORT || 1337;

// Amazon sqs set up
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: 'AKIAIPD6YCKCILPDGMGA',
  secretAccessKey: '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'
});

const queue = Consumer.create({
  queueUrl: 'https://sqs.us-east-2.amazonaws.com/928047465876/Trending',
  handleMessage: (message, done) => {
    var msgBody = JSON.parse(message.body);
    console.log('message', msgBody);
    done();
  },
  sqs: new AWS.SQS()
});

queue.on('error', (err) => {
  console.log(err.message);
});

queue.start();


app.use(bodyParser());
app.use(trending.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;