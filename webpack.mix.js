const mix = require('laravel-mix');
const path = require('path');

const webpack = require("webpack");

mix
    .webpackConfig({
        plugins: [
            new webpack.ExternalsPlugin('commonjs', [
                'electron'
            ])
        ],
        resolve: {
            alias: {
                    '@':              path.resolve(__dirname, 'src'),             // JS root
                    '@node_modules':  path.resolve(__dirname, 'node_modules'),
            },
        },
    })
    .copyDirectory('src/assets', 'public/assets')
    .copyDirectory('src/images', 'public/images')
    .css('src/css', 'public/css')
    .js('src/app.js', 'public/js')


    