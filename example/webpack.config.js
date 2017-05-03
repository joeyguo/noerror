var webpack = require('webpack'),
    os = require('os'),
    UglifyJsParallelPlugin = require('webpack-uglify-parallel');

module.exports = {
  entry: {
    main : './main.js',
  },
  output: {
    path: __dirname,
    filename: '[name].min.js',
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, loader: 'babel-loader'
      },
    ]
  },
  plugins: [
    new UglifyJsParallelPlugin({
        workers: os.cpus().length, 
        compress: {
          warnings: false,
        },
        // output: {
        //   semicolons: false,
        //   beautify: true
        // }
    })
  ],
  devtool: "source-map"
};

