let app = require('../index');
const ejs = require('ejs');

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
