const pool = require('./pool');

pool.on('connect', () => {
  console.log('connected to the db');
});