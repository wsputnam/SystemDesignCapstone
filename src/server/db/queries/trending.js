const knex = require('../connection');

function getAllMovies() {
  return knex('movies')
  .select('*');
}

function updateMovies(arr) {
  for (var i = 0; i < arr.length; i++) {
    var newViews = arr[i].recent_views;
    var id = arr[i].video_id;
    var params = {x1: newViews, x2: id}
    return knex.raw('update movies set recent_views = :x1, total_views = total_views + :x1 where video_id = :x2', params)
    .returning('*')
  }
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

