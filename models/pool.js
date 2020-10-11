const pg = require('pg');

const props = require('../config');
const url = `postgres://${props.db.username}:${props.db.password}@${props.db.host}:${props.db.port}/${props.db.database}`;
const databaseConfig = { connectionString: url };
const pool = new pg.Pool(databaseConfig);

module.exports = pool;