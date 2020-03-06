exports.up = function(knex, Promise) {
    return knex.schema.createTable('imagesizes', function (table) {
        table.increments();
        table.timestamps();
        table.string('key');
        table.string('name');
        table.text('config');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('imagesizes');
};
