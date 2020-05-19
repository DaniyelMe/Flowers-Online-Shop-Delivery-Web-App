const mongodb = require('./config/mongodb');
var User = require('./models/User');

User.collection.insert([
        {
            firstName: 'Israel',
            lastName: 'Frid',
            username: 'Admin1',
            password: '1',
            email: 'i0527630096@gmail.com',
            role: 'Admin'
        },
        {
            username: 'Employee1',
            password: '1',
            email: 'Employee1@gmail.com',
            role: 'Employee'
        },
        {
            username: 'Employee2',
            password: '1',
            email: 'Employee2@gmail.com',
            role: 'Employee'
        },
        {
            username: 'Customer1',
            password: '1',
            email: 'Customer1@gmail.com',
            role: 'Customer'
        },
        {
            username: 'Customer2',
            password: '1',
            email: 'Customer2@gmail.com',
            role: 'Customer'
        }
    ]
    , function (err, docs) {
        if (err) {
            console.log(err.message);
            return console.error(err);
        }
        console.log("Multiple documents inserted to Collection" + docs);
        process.exit(0);
    });
