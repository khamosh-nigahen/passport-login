// DB table creation is not done here, implement it as it will be a good learning

const pgPromise = require('pg-promise'); // pg-promise core library
const dbConfig = require('../db-config.json'); // db connection details

// pg-promise initialization options:
const initOptions = {}

const pgp = pgPromise(initOptions);

const db = pgp(dbConfig);

module.exports = {db, pgp};
