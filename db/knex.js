let config = require('../config/database');
const isDev = require('electron-is-dev');

let env = isDev ? 'dev' : 'production';
let knex = require('knex')(config[env]);

async function runMigration() {
    console.log('runMigration');
    const { exec } = require('child_process');
    const path = require('path');

    let cmd = path.join(process.cwd(), 'node_modules/.bin', 'knex migrate:latest').toString()
    let promis = new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
    await promis;
}
runMigration();

module.exports = knex;