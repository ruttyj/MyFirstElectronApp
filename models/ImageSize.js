var Model = require('../db');

var ImageSize = Model.extend({
    tableName: 'imagesizes'
});

module.exports = ImageSize;