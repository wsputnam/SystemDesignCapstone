const knex = require('../connection');

function getAllMovies() {
  return knex('movies')
  .select('*');
}

function updateMovies(arr) {
    // for (var i = 0; i < arr.length; i++) {
      var newViews = arr.recent_views;
      var id = arr.video_id;
      console.log('id', id);
      return knex('movies')
      .update({recent_views: parseInt(newViews)})
      .update({total_views: knex.raw('?? + ?', ['total_views', newViews])})
      .where(knex.raw('video_id = ?', [id]))
      .returning('*');
    // }
}

function indexRecentViews() {
  return knex.raw('create index trends on movies recent_views');
}

function getTrendingMovies(num) {
  var num = num || 3;
  return knex('movies')
  .select('video_id')
  .orderBy('recent_views', 'desc')
  .limit(num);
}



function deleteMovie(id) {
  return knex('movies')
  .del()
  .where({ video_id: parseInt(id) })
  .returning('*');
}




module.exports = {
  getAllMovies,
  updateMovies,
  indexRecentViews,
  getTrendingMovies,
  deleteMovie
};

