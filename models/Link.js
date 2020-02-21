var Model = require('../db');

var Link = Model.extend({
    tableName: 'links'
});

module.exports = Link;