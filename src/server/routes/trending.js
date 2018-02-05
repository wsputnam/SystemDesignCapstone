const Router = require('koa-router');
const queries = require('../db/queries/trending.js');
const axios = require('axios');

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
  try {
    const video = await queries.updateMovies(ctx.request.body);
    axios.post('videos'); // sending to matt's service
    if (video.length) {
      ctx.body = {
        status: 'success'
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
