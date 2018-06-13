const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: path.join(__dirname, './src/index.js')
    },

    output: {
        path: path.join(__dirname, 'public'),
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
    devtool: 'inline-source-map',

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

    devServer: {
        // contentBase: path.join(__dirname, 'public'),
        port: 9090,
        host: '0.0.0.0',
        overlay: true,
        historyApiFallback: true,
        noInfo: true,
        inline: true,
        compress: true, //服务器返回浏览器时是否启动gzip压缩
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        // new webpack.DefinePlugin({
		// 	'process.env.NODE_ENV': JSON.stringify('development')
		// }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            inject: true,
        }),
    ]
}