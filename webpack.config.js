// Example webpack configuration with asset fingerprinting in production.
'use strict'

const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
let extractCss = new ExtractTextPlugin('styles.css')
let extractHtml = new ExtractTextPlugin('index.html')
// must match config.webpack.dev_server.port
const devServerPort = 3808

// set NODE_ENV=production on the environment to add asset fingerprints
const production = process.env.NODE_ENV === 'production'

let config = {
  entry: {
    // Sources are expected to live in $app_root/webpack
    'scripts': './src/scripts.js'
  },

  output: {
    // Build assets directly in to public/webpack/, let webpack know
    // that all webpacked assets start with webpack/

    // must match config.webpack.output_dir
    path: path.join(__dirname, 'dist'),
    publicPath: '/',

    filename: '[name].js'
  },

  resolve: {
    // root: path.join(__dirname, '..', 'webpack')
    modules: [ path.join(__dirname, 'node_modules') ]
  },

  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
    extractCss,
    extractHtml
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }, {
        test: /\.css$/,
        use: extractCss.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader',
              options: { config: { path: path.join(__dirname, 'postcss.config.js') } }
            }
          ]
        })
      }, {
        test: /\.(html)$/,
        use: extractHtml.extract({
          loader: 'html-loader',
          options: {
            attrs: false,
            minimize: true
          }
        })
      }
    ]
  },
  devServer: {
    contentBase: [
      path.join(__dirname, 'dist'),
      path.join(__dirname, 'screenshots')
    ],
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
}

if (production) {
  config.plugins.push(
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      sourceMap: false
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.OccurrenceOrderPlugin()
  )
} else {
  // Source maps
  config.devtool = 'cheap-module-eval-source-map'
}

module.exports = config
