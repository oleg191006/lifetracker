/**
 * Webpack configuration for the Dashboard remote micro-frontend.
 *
 * REMOTE in the Module Federation architecture.
 * Exposes the DashboardPage component to the host shell.
 * Runs on port 3003.
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
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardPage': './src/pages/DashboardPage',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.1.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Life Tracker â€” Dashboard',
    }),
    ...(isDev ? [] : [new MiniCssExtractPlugin()]),
  ],

  devServer: {
    port: 3003,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  devtool: isDev ? 'eval-source-map' : 'source-map',
};

