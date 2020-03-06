exports.up = function(knex, Promise) {
    return knex.schema.createTable('images', function (table) {
        table.increments();
        table.timestamps();
        table.string('base_name').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('images');
};
