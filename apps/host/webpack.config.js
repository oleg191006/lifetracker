/**
 * Webpack configuration for the HOST (shell) app.
 *
 * Remote URLs:
 * - Development: each remote runs its own dev server (localhost:3002-3006)
 * - Production:  all remotes are built and served as static files under
 *                /remotes/<name>/ on the same domain as the host.
 *                The REMOTE_BASE env var can override the base URL if you
 *                want to host remotes on a CDN or separate domain.
 *
 * API URL:
 * - Set API_URL env var at build time (e.g. https://your-api.railway.app).
 * - DefinePlugin replaces `process.env.API_URL` in all bundled code.
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const isDev = process.env.NODE_ENV !== 'production';

// Base URL for remote entry files in production.
// Empty string = same-origin (Netlify serves everything from one domain).
const remoteBase = process.env.REMOTE_BASE || '';

/** Build remote URL — dev uses localhost ports, prod uses path-based routing */
function remoteUrl(name, devPort) {
  if (isDev) return `${name}@http://localhost:${devPort}/remoteEntry.js`;
  return `${name}@${remoteBase}/remotes/${name}/remoteEntry.js`;
}

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
      '@life-tracker/shared': path.resolve(__dirname, '../../packages/shared/src'),
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
    /**
     * DefinePlugin replaces `process.env.API_URL` in ALL bundled code
     * (including shared packages and remote modules loaded by this host).
     *
     * Set API_URL in your CI / Netlify environment variables:
     *   API_URL=https://life-tracker-api.up.railway.app
     */
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(
        process.env.API_URL || 'http://localhost:3000',
      ),
    }),

    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        auth:      remoteUrl('auth',      3002),
        dashboard: remoteUrl('dashboard', 3003),
        log:       remoteUrl('log',       3004),
        courses:   remoteUrl('courses',   3005),
        analytics: remoteUrl('analytics', 3006),
      },
      shared: {
        react:           { singleton: true, requiredVersion: '^18.3.1', eager: true },
        'react-dom':     { singleton: true, requiredVersion: '^18.3.1', eager: true },
        'react-router-dom': { singleton: true, requiredVersion: '^7.1.0', eager: true },
      },
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Life Tracker',
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/sw.js', to: 'sw.js' },
      ],
    }),

    ...(isDev ? [] : [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })]),
  ],

  devServer: {
    port: 3001,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  devtool: isDev ? 'eval-source-map' : 'source-map',

  // Production optimizations
  ...(isDev ? {} : {
    mode: 'production',
    optimization: {
      splitChunks: false, // Module Federation manages code splitting
    },
  }),
};
