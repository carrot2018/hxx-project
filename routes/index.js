var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login.html', function (req, res, next) {
  res.render('login');
});

router.get('/register.html', function (req, res) {
  res.render('register');
});


// router.get('/users.html', function (req, res) {
//   res.render('users');
// });

// router.get('/brand.html', function (req, res) {
//   res.render('brand');
// });

// router.get('/phone.html', function (req, res) {
//   res.render('phone');
// });

module.exports = router;
