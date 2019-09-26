/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const TerserPlugin = require('terser-webpack-plugin');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');

const customIcons = [
  'underline', 'align-center', 'align-left', 'align-right', 'align-justify', 'attachment', 'bold',
  'bulletedlist', 'font-color', 'font-size', 'image', 'indent', 'italic', 'link-resource',
  'link', 'unlink', 'numberedlist', 'outdent', 'quote', 'strikethrough', 'table', 'dropdown-arrow',
  'pencil', 'remove-format',
];

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
      language: 'zh-cn',
    }),
    new webpack.NormalModuleReplacementPlugin(
      /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/,
      (result) => {
        const match = result.request.match(/ckeditor5-[^/]+\/theme\/icons\/([^/]+)\.svg$/);
        if (match && customIcons.includes(match[1])) {
          result.resource = path.resolve(__dirname, `src/theme/icons/${match[1]}.svg`); // eslint-disable-line
        }
      },
    ),
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
