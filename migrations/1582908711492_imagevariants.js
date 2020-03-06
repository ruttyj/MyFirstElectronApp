exports.up = function(knex, Promise) {
    return knex.schema.createTable('imagevariants', function (table) {
        table.increments();
        table.timestamps();
        table.integer('image_id').index().references('id').inTable('images').onDelete('CASCADE');
        table.integer('image_size_id').index().references('id').inTable('imagesizes').onDelete('CASCADE');
        table.blob('base64').nullable();
        table.string('ext').nullable();
        table.integer('file_size').nullable();
        table.string('mime_type').nullable();
        table.string('config').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('imagevariants');
};
