const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'renewables_db',
  password: 'FDOPR4973m@',
  port: 5432,
});

module.exports = pool;