const express = require('express');
const https = require('https');

const app = express();

const PORT = 3000;
const DEFAULT_PROCESS_TIME = 5

app.get('/', (req, res) => {
  console.log('Requested /, saying "Hola, mundo"');
	res.send('Hola, mundo!');
});

app.get('/timeout', (req, res) => {
  const process_time = req.query.processTime || DEFAULT_PROCESS_TIME;
  const process_time_in_seconds = process_time * 1000;
  console.log(`Requested /timeout, sleeping ${process_time} milliseconds`);

	setTimeout(() => {
		res.send('Timeout reached');
	}, process_time_in_seconds);
});

app.get('/cpu', (req, res) => {
  const process_time = req.query.processTime || DEFAULT_PROCESS_TIME;
  const process_time_in_seconds = process_time * 1000;
  console.log(`Requested /cpu, using cpu for ${process_time} milliseconds`);

  let result = 0;
  const start = new Date().getTime();
  while(new Date().getTime() - start < process_time_in_seconds) {
    result += Math.random() * Math.random();
  }

  res.send('Finished using cpu!');
});

app.get('/external', (req, res) => {
  const process_time = req.query.processTime || DEFAULT_PROCESS_TIME;
  const process_time_in_seconds = process_time * 1000;
  const url = `https://httpstat.us/200?sleep=${process_time_in_seconds}`;

  console.log('Requested /external endpoint, making a request to ' + url);
  https.get(url, (response) => {
    const { statusCode } = response;
    res.send('External service request finished with status: ' + statusCode);
  });
});

app.listen(PORT, () => {
	console.log('Listenning on port', PORT);
});
