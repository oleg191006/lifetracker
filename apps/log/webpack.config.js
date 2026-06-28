/**
 * Webpack configuration for the Log remote micro-frontend.
 *
 * REMOTE in the Module Federation architecture.
 * Exposes the LogPage component to the host shell.
 * Runs on port 3004.
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: 'auto',
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@life-tracker/shared': path.resolve(
        __dirname,
        '../../packages/shared/src',
      ),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },

  plugins: [
    // Inject API_URL at build time so the shared API client uses the right URL
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(
        process.env.API_URL || 'http://localhost:3000',
      ),
    }),

    /**
     * ModuleFederationPlugin turns this app into a "remote" that
     * the host shell can load at runtime. The `exposes` map tells
     * federation which modules other apps can import.
     */
    new ModuleFederationPlugin({
      name: 'log',
      filename: 'remoteEntry.js',
      exposes: {
        './LogPage': './src/pages/LogPage',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.1.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Life Tracker â€” Quick Entry',
    }),
    ...(isDev ? [] : [new MiniCssExtractPlugin()]),
  ],

  devServer: {
    port: 3004,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  devtool: isDev ? 'eval-source-map' : 'source-map',
};

