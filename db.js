const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './db.db'
    }
})

module.exports = knex