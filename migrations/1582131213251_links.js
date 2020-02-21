exports.up = function(knex, Promise) {
    return knex.schema.createTable('links', function (table) {
        table.increments();
        table.string('url').nullable();
        table.string('label').nullable();
        table.blob('image').nullable();
        table.blob('imageMime').nullable();
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('links');
};
