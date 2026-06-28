/**
 * Webpack configuration for the AUTH remote micro-frontend.
 *
 * This is a REMOTE in the Module Federation architecture.
 * It EXPOSES the LoginPage component so the host can load it.
 *
 * Key differences from the host config:
 * - Uses `exposes` instead of `remotes`
 * - Has its own dev server on a unique port (3002)
 * - Can also run standalone for independent development
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
    // Inject API_URL at build time — same value used by the host
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(
        process.env.API_URL || 'http://localhost:3000',
      ),
    }),

    /**
     * ModuleFederationPlugin for a REMOTE app.
     *
     * `name` must match what the host uses in its `remotes` config:
     *   host config: auth: 'auth@http://localhost:3002/remoteEntry.js'
     *                 ^^^^  ^^^^
     *                 alias  this name
     *
     * `filename`: the entry file that the host downloads to discover
     *   this remote's exposed modules. Default is 'remoteEntry.js'.
     *
     * `exposes`: defines which modules this remote makes available.
     *   The key (e.g., './LoginPage') becomes the import path:
     *   import('auth/LoginPage') in the host code.
     */
    new ModuleFederationPlugin({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './LoginPage': './src/pages/LoginPage',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.1.0',
        },
      },
    }),

    // HtmlWebpackPlugin allows this remote to run standalone
    // (visit http://localhost:3002 to test it independently)
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Life Tracker — Login',
    }),

    ...(isDev ? [] : [new MiniCssExtractPlugin()]),
  ],

  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  devtool: isDev ? 'eval-source-map' : 'source-map',
};
