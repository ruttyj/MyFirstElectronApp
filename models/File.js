var Model = require('../db');

var Link = Model.extend({
    tableName: 'files'
});

module.exports = Link;