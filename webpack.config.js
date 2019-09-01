/* eslint-env node */

const path = require('path');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const TerserPlugin = require('terser-webpack-plugin');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'teditor.js'),
  output: {
    filename: 'teditor.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    library: 'TEditor',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  devtool: 'source-map',
  performance: { hints: false },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new CKEditorWebpackPlugin({
      language: 'zh-CN',
    }),
  ],
  module: {
    rules: [{
      test: /\.svg$/,
      use: ['raw-loader'],
    }, {
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      use: ['eslint-loader'],
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'postcss-loader',
        options: styles.getPostCssConfig({
          themeImporter: {
            themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
          },
          minify: true,
        }),
      }],
    }],
  },
};
