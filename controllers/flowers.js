let app = require('../index');
let db = require('../database');

app.get('/flowers', (req, res) => {
	res.send(db.getAll('flowers'));
});
