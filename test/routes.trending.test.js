process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../src/server/serverIndex');
const knex = require('../src/server/db/connection');

describe('routes : trending', () => {

  beforeEach(() => {
    return knex.migrate.rollback()
    .then(() => { return knex.migrate.latest(); })
    .then(() => { return knex.seed.run(); });
  });

  afterEach(() => {
    return knex.migrate.rollback();
  });

  // put unit tests here
  
    describe('POST /videos', () => {
        it('should return the movie that was deleted', (done) => {
            knex('movies')
                .select('*')
                .then((movies) => {
                    const movieObject = movies[0];
                    const lengthBeforeDelete = movies.length;
                    chai.request(server)
                        .post('/videos')
                        .end((err, res) => {
                            // there should be no errors
                            should.not.exist(err);
                            // there should be a 200 status code
                            res.status.should.equal(200);
                            // the response should be JSON
                            res.type.should.equal('application/json');
                            // the JSON response body should have a
                            // key-value pair of {"status": "success"}
                            res.body.status.should.eql('success');
                         
                            res.body.data.should.include.keys(
                                'video_id', 'recent_views', 'total_views'
                            );
                            // ensure the movie was in fact deleted
                            knex('movies').select('*')
                                .then((updatedMovies) => {
                                    updatedMovies.length.should.eql(lengthBeforeDelete - 1);
                                    done();
                                });
                        });
                });
        });
        it('should throw an error if the movie does not exist', (done) => {
            chai.request(server)
                .delete('/videos')
                .end((err, res) => {
                    // there should an error
                    should.exist(err);
                    // there should be a 404 status code
                    res.status.should.equal(404);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "error"}
                    res.body.status.should.eql('error');
                    // the JSON response body should have a
                    // key-value pair of {"message": "That movie does not exist."}
                    res.body.message.should.eql('That movie does not exist.');
                    done();
                });
        });
    });

    describe('GET /trending', () => {
        it('should return top three movies', (done) => {
            chai.request(server)
                .get('/trending')
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    res.status.should.equal(200);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    res.body.status.should.eql('success');
                    // the JSON response body should have a
                    // key-value pair of {"data": [3 movie objects]}
                    res.body.data.movies.length.should.eql(3);
                    // the first object in the data array should
                    // have the right keys
                    res.body.data.movies[0].should.include.keys(
                        'video_id'
                    );
                    done();
                });
        });
    });

    describe('POST /events', () => {
        it('should respond with a single updated movie', (done) => {
            chai.request(server)
                .post('/events')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    video_id: "50",
                    recent_views: 1

                })
                .end((err, res) => {
                    // there should be no errors
                    console.log('res', res);
                    console.log('err', err);
                    should.not.exist(err);
                    // there should be a 200 status code
                    res.status.should.equal(201);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    res.body.status.should.eql('success');
                    // the JSON response body should have a
                    // key-value pair of {"data": 1 movie object}
                    res.body.data.should.include.keys(
                        'video_id', 'recent_views', 'total_views'
                    );
                    done();
                });
        });
    });

});

