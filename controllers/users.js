let app = require('../index');
let db = require('../database');

app.get('/users', (req, res) => {
	res.send(db.getAll('users'));
});

app.get('/users/:id', (req, res) => {
	res.send(db.getOne('users', 'id', req.params.id));
});

app.delete('/users/:id', (req, res) => {
	res.send(db.remove('users', 'id', req.params.id));
});

app.patch('/users/:id', (req, res) => {

	db.update('users', 'id', req.params.id, req.body);

	res.send('User Updated!');
});
