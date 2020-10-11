const pool = require('./pool');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });

};

module.exports = query;