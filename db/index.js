let knex = require('./knex');



let bookshelf = require('bookshelf')(knex);




module.exports = bookshelf.Model;