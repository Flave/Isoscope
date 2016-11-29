var path = require('path');
var webpack = require('webpack');

console.log(process.env.NODE_ENV);

module.exports = {
  context: __dirname + "/src",
  entry: {
    app: "./main.js",
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ["src/components", "node_modules"]
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        test: /\.jsx?$/,
        loader: "babel-loader",
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.eot$|\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        // assets for production need to be in bms-01/assets folder. This could be part of config.js but
        // works fine if it is always like that
        loader: "file?name=[hash]-[name].[ext]"
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  },
  // context: path.join(__dirname, 'build'),
  plugins: [
    new webpack.EnvironmentPlugin('NODE_ENV')
  ]
};