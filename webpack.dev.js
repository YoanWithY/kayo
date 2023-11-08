const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Import the copy-webpack-plugin

module.exports = {
    mode: 'development',
    entry: './src/ts/app.ts', // Update the entry point to src/ts/app.ts
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(glsl|frag|vert)$/,
                use: 'raw-loader', // Use raw-loader for shader files
            },
        ],
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        port: 8080,
        open: true,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon: './src/favicon.ico', // Add the path to your favicon
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './src/favicon.ico', // Add the path to your favicon
                    to: './favicon.ico', // Output to the root of the output directory
                },
            ],
        }),
    ],
};
