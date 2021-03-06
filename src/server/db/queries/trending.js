const knex = require('../connection');


function updateMovies(obj) {
    console.log('obj', obj);
    obj = JSON.parse(obj);
    var id;
    if (obj) {
      id = obj.video_id;
    }
    var newViews = 1;
    console.log('id', id);

    return knex('movies')
    .update({recent_views: 1}) // getting an object upon each view
    .update({total_views: knex.raw('?? + ?', ['total_views', newViews])})
    .where(knex.raw('video_id = ?', [id]))
    .returning('*');

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
  updateMovies,
  indexRecentViews,
  getTrendingMovies,
  deleteMovie
};

