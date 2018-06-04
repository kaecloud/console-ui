const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        app: path.join(__dirname, './src/index.js'),
        vonder: ['react', 'react-router-dom', 'react-dom']
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },

    resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			components: path.resolve(__dirname, './src/components'),
            pages: path.resolve(__dirname, './src/pages'),
            api: path.resolve(__dirname, './src/API')
		}
	},

    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                        // modules: true,
                        camelCase: true,
                        sourceMap: true
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            inject: true,
        }),
    ]
}