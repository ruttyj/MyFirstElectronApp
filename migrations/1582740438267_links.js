exports.up = function(knex, Promise) {
    return knex.schema.table('links', table =>{
        table.integer('display_order');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('links', table => {
        table.dropColumn('display_order');
    })
};
