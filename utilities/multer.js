const debug = require('debug')('ex6:config-multer');
const fs = require('fs');
const multer = require('multer');

/**
 * upload files
 * in directory name as the url
 * temporary file name as the session id
 */
exports.upload = (req, res, next) => {
    const storage = multer.diskStorage({
        destination: function (req, file, fn) {
            let  dest = '../uploads' + req.originalUrl;
            if (!fs.existsSync(dest)) {
                let dirName = "";
                const destPathSplit = dest.split('/');
                for (let i = 0; i < destPathSplit.length; i++) {
                    dirName += destPathSplit[i] + '/';
                    if (!fs.existsSync(dirName))
                        fs.mkdirSync(dirName);
                }
                fn(null, dest)
            } else {
                fn(null, dest)
            }
        },
        filename: function (req, file, fn) {
            let fileName = req.sessionID + '.jpg';
            fn(null, fileName);
        }
    });
    const upload = multer({storage: storage})
    upload.single('file')(req, res, function (err) {
        if (err) {
            debug(JSON.stringify(err));
            res.status(400).send(err);
        } else {
            res.send('uploaded successfully.');
        }
    });
};

/**
 * upload profile Images
 * in directory name '/uploads/account/profileImage'
 * temporary file name as the session id
 * and in registration/update function
 * it will rename to username
 */
exports.uploadProfileImage = (req, res, next) => {
    const storage = multer.diskStorage({
        destination: function (req, file, fn) {
            const dest = '../uploads/account/profileImage';
            if (!fs.existsSync(dest)) {
                let dirName = "";
                const destPathSplit = dest.split('/');
                for (let i = 0; i < destPathSplit.length; i++) {
                    dirName += destPathSplit[i] + '/';
                    if (!fs.existsSync(dirName))
                        fs.mkdirSync(dirName);
                }
                fn(null, dest)
            } else {
                fn(null, dest)
            }
        },
        filename: function (req, file, fn) {
            let fileName = req.sessionID + '.jpg';
            fn(null, fileName);
        }
    });
    const upload = multer({storage: storage})
    upload.single('file')(req, res, function (err) {
        if (err) {
            debug(JSON.stringify(err));
            res.status(400).send(err);
        } else {
            res.send('uploaded successfully.');
        }
    });
};