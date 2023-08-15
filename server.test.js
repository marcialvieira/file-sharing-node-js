const request = require('supertest');
var assert = require('assert');
var app = require('./server.js');
app.address = function(){
    return { 'port': 3000 }
}

request(app)
  .post('/upload')
  .field('name', 'server.test.gz')
  .attach('file', './server.test.gz')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err
    else {
      console.log('Upload empty file test, ok.')
      process.exit(0)
    }
  })
