/* eslint-disable */
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  lazy: false,
}));

app.use(express.static('./'))

app.use(fileUpload());

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const imageFile = req.files.image;

  // Use the mv() method to place the file somewhere on your server
  imageFile.mv(`./uploads/${imageFile.name}`, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

// Serve the files on port 3333.
app.listen(3333, function () {
  console.log('Example app listening on port 3333!\n');
});