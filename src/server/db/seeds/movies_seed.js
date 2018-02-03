
exports.seed = (knex, Promise) => {
  return knex('movies').del()
  .then(() => {
    return knex('movies').insert({
      total_views: 100,
      recent_views: 10,
      video_id: 1234
    });
  })
  .then(() => {
    return knex('movies').insert({
      total_views: 50,
      recent_views: 5,
      video_id: 1233
    });
  })
  .then(() => {
    return knex('movies').insert({
      total_views: 80,
      recent_views: 8,
      video_id: 1235
    });
  });
};
