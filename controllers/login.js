let app = require('../index');
let db = require('../database');

function checkCredentials(username, password) {
  let userFromDb = db.getOne('users', 'username', username);

  // In user is undefined, then it doesnt exist.
  if (!userFromDb) throw Error('Username Doesn\'t exist');

  // Check password
  if(password !== userFromDb.password) throw Error('Invalid Password');
}

app.post('/login', (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase();

  try {
    // If it doesnt throw then the username and password match.
    checkCredentials(username, password);

    res.send({
      error: false,
      message: 'Logged in successfuly'
    });
  } catch(e) {
    res.status = 400;
    res.send({
      error: true,
      message: e.message
    });
  }
});
