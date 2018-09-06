const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
		polyfills: path.resolve('src', 'polyfill.ts'),
		vendor: path.resolve('src', 'vendor.ts'),
		app: path.resolve('src', 'index.tsx')
	},
	resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(ts,tsx)$/,
                loader: 'tslint-loader'
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: path.resolve('node_modules'),
                loader: 'source-map-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { 
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                })
            },
            {
                test: /\.(svg|jpg|png)$/,
                use: [
                    {
                        loader: 'file-loader?name=assets/icons/[name].[ext]'
                    }
                ]
            },
            {
                test: /\.(eot|ttf|woff|woff2|otf)$/,
                use: [
                    {
                        loader: 'file-loader?name=assets/fonts/[name].[ext]'
                    }
                ]
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('style.css'),
		new webpack.NamedModulesPlugin(),
        new CopyWebpackPlugin([
            { from: "src/plain", to: ""}
        ]),
        new HtmlWebpackPlugin({
            template: path.resolve('src', 'index.html')
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: ['app', 'vendor', 'polyfills']
		})
    ]
};