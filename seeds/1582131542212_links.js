exports.seed = function (knex, Promise) {
    return knex('links').del()
        .then(function () {
            return knex('links').insert([
                { 
                    url: 'https://tympanus.net/Development/ElasticSVGElements/drag.html', 
                    label: 'Elastic SVG Elements: DRAG & DROP',
                    created_at: new Date, 
                    updated_at: new Date 
                }
            ]);
        });
};