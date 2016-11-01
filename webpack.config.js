var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var entries = ['./src/client.js'];
var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    __CLIENT__: true,
    __SERVER__: false,
    __DEVELOPMENT__: process.env.NODE_ENV !== 'production',
    'process.env.NODE_ENV': '\"' + process.env.NODE_ENV + '\"'
  }),
  new ExtractTextPlugin('bundle.css', {
    disable: process.env.NODE_ENV !== 'production'
  }),
  new HtmlWebpackPlugin({
    title: 'kkiro3d'
  })
];

const PRODUCTION = process.env.NODE_ENV === 'production';

if (PRODUCTION) {
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  // devtool: 'eval-source-map',
  context: __dirname,
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[id].js'
  },
  plugins: plugins,
  node: {
    fs: 'empty',
    tls: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'react-hot!babel'
      },
      {
        test: /\.json$/i,
        loader: 'json'
      },
      {
        test: /\.html?$/i,
        loader: 'html'
      },
      {
        test: /\.css$/i,
        loader: PRODUCTION ?
          ExtractTextPlugin.extract('style', 'css!import-glob') :
          'style!css!import-glob'
      },
      {
        test: /\.s[ca]ss$/i,
        loader: PRODUCTION ?
          ExtractTextPlugin.extract('style', 'css!sass!import-glob') :
          'style!css!sass!import-glob'
      },
      {
        test: /(\.vert|\.frag|\.obj|\.mtl)$/i,
        loader: 'raw'
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)(\?.+)?$/,
        loader: 'url-loader?limit=10240'
      },
      {
        test: /\.(png|jpe?g|gif|tiff|mp4|mkv|webm)?$/,
        loader: 'file-loader'
      }
    ]
  }
};
