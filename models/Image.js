var Model = require('../db');


var Image = Model.extend({
    tableName: 'images',
   
});

module.exports = Image;