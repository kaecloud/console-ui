const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    vonder: ['antd', 'react', 'react-router-dom', 'react-dom'],
    app: path.join(__dirname, './src/index.js'),
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'static/js/[name].[hash:6].js'
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
          MiniCssExtractPlugin.loader,
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
    new MiniCssExtractPlugin({
      filename: "static/css/style.[name].css",
      chunkFilename: "static/css/style.[id].css"
    }),
    new ParallelUglifyPlugin({
      workerCount: 4,
      uglifyJS: {
        output: {
          beautify: false, //不需要格式化
          comments: true
        },
        compress: {
          warnings : false,
          drop_console: true,
          collapse_vars: true, // 内嵌定义了但是只有用到一次的变量
          reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
        }
      }
    }),
    new CleanWebpackPlugin(
      ['dist/*'],　 //匹配删除的文件
      {
        root: __dirname,       　　　　　　　　　　//根目录
        verbose:  true,        　　　　　　　　　　//开启在控制台输出信息
        dry:      false        　　　　　　　　　　//启用删除文件
      }
    ),
    new CopyWebpackPlugin([
      {from: './src/images/favicon.ico', to: 'static/favicon.ico' },
    ])
  ]
}
