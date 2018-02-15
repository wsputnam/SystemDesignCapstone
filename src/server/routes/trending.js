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
 
  client.flushdb();
}, null,
  true,
  'America/Los_Angeles' 
);


router.get('/', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'welcome to trending service!'
  };
})

router.get('/trending', async (ctx) => {
  try {
  
    
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

    const num = 3;
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
   
    client.set('newViews', JSON.stringify(ctx.request.body));

    var params = {
      MessageBody: JSON.stringify(ctx.request.body),
      QueueUrl: 'https://sqs.us-east-2.amazonaws.com/482177334603/trendin',

    };
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log('error', err);
      }
      else {
        console.log('message HELLO!!', data, ctx.request.body);
      }
    });
    if (ctx.request.body) {
      ctx.status = 201;

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

  client.get('newViews', function (err, res) {
    queries.updateMovies(res);
  });
}, null,
  true, 
  'America/Los_Angeles'
);


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
