exports.seed = function (knex, Promise) {
    return knex('imagesizes').del()
        .then(function () {
            return knex('imagesizes').insert([
                { 
                    id: 1,
                    key: 'original',   
                    name: 'Original', 
                    config: JSON.stringify({}),
                    created_at: new Date, 
                    updated_at: new Date 
                },
                
                {   id: 2,
                    key: 'thumb', 
                    name: 'Thumb', 
                    config: JSON.stringify({
                        height: 300,
                        width:  300,
                        fit:    'inside',
                        withoutEnlargement: true
                    }),
                    created_at: new Date, 
                    updated_at: new Date 
                },
                { 
                    id: 3,
                    key: 'pin',   
                    name: 'Pin', 
                    config: JSON.stringify({
                        height: 50,
                        width:  50,
                        fit:    'inside',
                        withoutEnlargement: true
                    }),
                    created_at: new Date, 
                    updated_at: new Date 
                },
            ]);
        });
};