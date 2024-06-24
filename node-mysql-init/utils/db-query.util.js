const pool = require('./db-pool.util');
const AppError = require('./app-error.util');

const dbQuery = async (query, params) => {
  let connection;

  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (err) {
    throw new AppError('Database query failed', 500);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = dbQuery;
