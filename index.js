const express = require('express');
const fs = require('fs');
const http = require('http');
const app = express();

app.use((req, res, next) => {
	console.log(`[${req.method}] - ${req.originalUrl}`);

	next();
});

app.get('/', (req, res) => {
	res.send('You are viewing the homepage');
});

app.get('/users', (req, res) => {
	const allUsers = require('./database/users');

	res.send(allUsers);
});

app.get('/flowers', (req, res) => {
	res.send('You are viewing the flowers');
});

app.get('/branches', (req, res) => {
	res.send('You are viewing the branches');
});



	fs.readFile('./assets/templates/index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});  // <-- HERE!
        response.write(html);  // <-- HERE!
        response.end();
    }).listen(3000, '127.0.0.1');

app.listen(3000, () => {
	console.log('server running');
	});

});
