exports.up = function(knex, Promise) {
    return knex.schema.createTable('files', function (table) {
        table.increments();
        table.timestamps();
        table.blob('content').nullable();
        table.string('base').nullable();
        table.string('ext').nullable();
        table.integer('size').nullable();
        table.string('mime').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('files');
};
