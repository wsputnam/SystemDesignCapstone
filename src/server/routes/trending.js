const Router = require('koa-router');
const queries = require('../db/queries/trending.js');
const config = require('./config.js');
var CronJob = require('cron').CronJob;



// const statsDConfig = require('./StatsDConfig.js');
// const statsD = require('node-statsd');
// const statsDClient = new statsD({
//   host: 'statsd.hostedgraphite.com',
//   port: 8125,
//   prefix: statsDConfig.API
//   // prefix: process.env.HOSTEDGRAPHITE_APIKEY
// });

// redis cache set up
let redis = require('redis');
let client = redis.createClient(6379, {no_ready_check: true});

client.auth((err) => {
  if (err) console.log('error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

// Amazon sqs set up
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');



AWS.config.update({
  region: 'us-east-2',
  accessKeyId: config.keyId,
  secretAccessKey: config.key
});




const queue = Consumer.create({
  queueUrl: 'https://sqs.us-east-2.amazonaws.com/482177334603/trendin',
  handleMessage: (message, done) => {
    done();
  },
  sqs: new AWS.SQS()

});

queue.on('error', (err) => {
  console.log(err.message);
});

queue.start();

const sqs = new AWS.SQS();

const router = new Router();

// cron job to flush redis db
var flushRedis = new CronJob('* */10 * * * *', function () {
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
  client.flushdb();
}, null,
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);

// setInterval(function() {
//   client.flushdb();
// }, 900000);

router.get('/', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'welcome to trending service!'
  };
})

router.get('/trending', async (ctx) => {
  try {
    // var start = Date.now();
    // statsDClient.increment('.service.fire.query.notAll', 1);
    
    var movies = null;
    client.get('3', function(err, res) {
      movies = res;
    })
    //  await client.get('3'); // count will always be 3
    console.log('movies', movies);
    if (movies) {
      console.log('redis in action');
      ctx.body = {
        status: 'success',
        data: {
          count: 3, // || num
          movies
        }
      }
    } else {
    movies = await queries.getTrendingMovies(3);
    console.log('movies', movies)
    // statsDClient.timing('.service.fire.query.trending_latency_ms', Date.now() - start);

    const num = 3;
    // statsDClient.timing('.service.fire.query.trending_node_latency_ms', Date.now() - start);
    client.set('3', JSON.stringify(movies), function (err) {
      if (err) {
        console.log('error', err);
      }
    });
   
    ctx.body = {
      status: 'success',
      data: {
        count: 3,
        movies
       }
    }
  }
  } catch (err) {
    console.log('error', err)
  }
});

router.post('/events', async (ctx) => {
  try {
    // var start = Date.now();
    // statsDClient.increment('.service.fire.query.all', 1);
    client.set('newViews', JSON.stringify(ctx.request.body));
    // const video = await queries.updateMovies(ctx.request.body);
    // statsDClient.timing('.service.fire.query.update_latency_ms', Date.now() - start);
    var params = {
      MessageBody: JSON.stringify(ctx.request.body),
      QueueUrl: 'https://sqs.us-east-2.amazonaws.com/482177334603/trendin',

    };
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log('error', err);
      }
      // else {
      //   console.log('message HELLO!!', data, ctx.request.body);
      // }
    });
    if (ctx.request.body) {
      ctx.status = 201;
      // statsDClient.timing('.service.fire.query.update_node_latency_ms', Date.now() - start);

      ctx.body = {
        status: 'success',
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'not valid'
      };
    }
  } catch (err) {
    console.log('error updating views', err);
  }
})

// updating postgres db from updated table in redis cache every 5 minutes
var updatePG = new CronJob('* */4 * * * *', function () {
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
  client.get('newViews', function (err, res) {
    queries.updateMovies(res);
  })
  // queries.updateMovies(client.get('newViews'));
}, null,
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);
// setInterval(function() {
//   console.log('updating postgres db');
//   queries.updateMovies(client.get('newViews'));
// }, 300000);

// set up new movie uploaded route from Matt
router.post('/videos', async (ctx) => {
  console.log('ctx', ctx.request.body);
  try {
    const movie = await queries.deleteMovie(ctx.request.body.video_id);
    if (movie.length) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: movie
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'That movie does not exist.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.'
    };
  }
})


module.exports = router;
