const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

process.on('uncaughtException', function(err) {
  // Add some code here to process the excpetion
  console.log('strill running...');
});

app.listen(3000);