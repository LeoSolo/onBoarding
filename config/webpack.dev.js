const webpackMerge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')
const webpack = require('webpack')
const path = require('path');

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',
	output: {
		filename: '[name].js',
		chunkFilename: '[id].chunk.js',
		path: path.resolve('dist'),
		publicPath: '/'
	},
	devServer: {
        contentBase: path.resolve('dist'),
        hot: false
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
})