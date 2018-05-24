const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        app: path.join(__dirname, './src/index.js')
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },

    resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			components: path.resolve(__dirname, './src/components'),
			pages: path.resolve(__dirname, './src/pages')
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
            }
        ]
    },

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9090,
        host: 'localhost',
        overlay: true,
        compress: true //服务器返回浏览器时是否启动gzip压缩
    }
}