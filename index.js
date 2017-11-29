const express = require('express');
const app = express();
const ejs = require('ejs');

app.use((req, res, next) => {
	console.log(`[${req.method}] - ${req.originalUrl}`);

	next();
});

app.get('/', (req, res) => {
	let data = {
		title: 'test',
		heading: 'Its working!',
		array: ['samuel', 'daniyel', 'menahem']
	};


	ejs.renderFile(__dirname + '/templates/index.ejs', data, function(err, renderedTemplate) {
		if(err) throw err;
    res.send(renderedTemplate);
	});
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
	console.log('Server running on http://10.0.0.127:3000');
});
