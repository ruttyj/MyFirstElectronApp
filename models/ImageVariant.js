var Model = require('../db');
const Image = require('./Image');
const ImageSize = require('./ImageSize');

var ImageVariant = Model.extend({
    tableName: 'imagevariants',
    image() {
        return this.belongsTo(Image, 'image_id', 'id')
    },
    size() {
        return this.belongsTo(ImageSize, 'image_size_id', 'id')
    }
});

module.exports = ImageVariant;