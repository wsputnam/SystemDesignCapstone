exports.up = (knex, Promise) => {
  return knex.schema.createTable('movies', (table) => {
  	table.bigint('video_id').notNullable().unique();
    table.integer('recent_views').notNullable();
    table.bigint('total_views').notNullable();
    //should be unique, but not for testing data generation
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('movies');
};
