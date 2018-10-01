const express = require('express');
const https = require('https');

const app = express();

const PORT = 3000;

const TIMEOUT_SECONDS = 5;

app.get('/', (req, res) => {
  console.log('Requested /, saying "Hola, mundo"');
	res.send('Hola, mundo!');
});

app.get('/timeout', (req, res) => {
  console.log('Requested /timeout, sleeping', TIMEOUT_SECONDS, 'seconds');
	setTimeout(() => {
		res.send('Timeout reached');
	}, TIMEOUT_SECONDS * 1000);
});

app.get('/cpu', (req, res) => {
  console.log('Requested /cpu, using cpu for 5 seconds');
  var start = new Date().getTime();

  var result = 0
  while(new Date().getTime() - start < 5000) {
    result += Math.random() * Math.random();
  }

  res.send('Finished using cpu!');
});

app.get('/external', (req, res) => {
  var url = 'https://httpstat.us/200?sleep=5000';
  console.log('Requested /external endpoint, making a request to ' + url);
  https.get(url, (response) => {
    const { statusCode } = response;
    res.send('External service request finished with status: ' + statusCode);
  });
});

app.listen(PORT, () => {
	console.log('Listenning on port', PORT);
});
