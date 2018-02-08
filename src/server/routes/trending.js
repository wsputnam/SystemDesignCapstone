const Router = require('koa-router');
const queries = require('../db/queries/trending.js');
const axios = require('axios');
const config = require('./config.js');


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
// const Consumer = require('sqs-consumer');
// const AWS = require('aws-sdk');



// AWS.config.update({
//   region: 'us-east-2',
//   accessKeyId: config.keyId,
//   secretAccessKey: config.key
// });




// const queue = Consumer.create({
//   queueUrl: 'https://sqs.us-east-2.amazonaws.com/928047465876/Trending',
//   handleMessage: (message, done) => {
//     console.log('message', message.body);
//     done();
//   },
//   sqs: new AWS.SQS()

// });

// queue.on('error', (err) => {
//   console.log(err.message);
// });

// queue.start();

// const sqs = new AWS.SQS();

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'welcome to trending service!'
  };
})

router.get('/trending', async (ctx) => {
  try {
    const movies = await queries.getTrendingMovies(ctx.request.body.count);
    const num = ctx.request.body.count;
    client.flushdb();
    client.hmset(movies, [movies]);
    client.hmget(movies);
    ctx.body = {
      status: 'success',
      data: {
        count: num || 3,
        movies
       }
    }
  } catch (err) {
    console.log('error', err)
  }
});

router.post('/events', async (ctx) => {
  console.log('ctx', ctx.request.body);
  try {
    const video = await queries.updateMovies(ctx.request.body);
    // var params = {
    //   MessageBody: JSON.stringify(video),
    //   QueueUrl: 'https://sqs.us-east-2.amazonaws.com/928047465876/Trending',

    // };
    // sqs.sendMessage(params, function(err, data) {
    //   if (err) {
    //     console.log('error', err);
    //   }
    //   else {
    //     console.log('message', data, video);
    //   }
    // });
    if (video.length) {
      ctx.body = {
        status: 'success',
        data: {
          video
        }
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


router.post('/videos', async (ctx) => {
  console.log('ctx', ctx.request.body);
  try {
    const movie = await queries.deleteMovie(ctx.request.body.video_id);
    console.log('movie', movie);
    if (movie.length) {
      ctx.status = 200;
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
