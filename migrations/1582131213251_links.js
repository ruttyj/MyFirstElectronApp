exports.up = function(knex, Promise) {
    console.log('links up');
    return knex.schema.createTable('links', function (table) {
        table.increments();
        table.string('url').nullable();
        table.string('label').nullable();
        table.timestamps().defaultTo(knex.fn.now());
        table.uuid('id').primary();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('links');
};
