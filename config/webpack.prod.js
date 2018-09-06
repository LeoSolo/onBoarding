const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig, {
	output: {
		filename: '[name].[hash].js',
		chunkFilename: '[id].[hash].chunk.js',
		path: path.resolve('dist'),
		publicPath: '/'
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: {
				keep_fnames: true
			}
		}),
		new webpack.optimize.LimitChunkCountPlugin({maxChunks: 10}),
		new webpack.LoaderOptionsPlugin({
			htmlLoader: {
				minimize: true
			}
		})
    ]
})


