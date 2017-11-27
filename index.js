const express = require('express');
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



app.listen(3000, () => {
	console.log('server running');
});
