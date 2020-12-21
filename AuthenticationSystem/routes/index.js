var express = require('express');
var router = express.Router();

var levelPlans = [];
// Get Home
router.get('/', ensureAuthentication, function (req, res) {

    res.render('index');
});


/*  Level.getLevel("1", function (err, level) {
      var res = level.name.split("-");
      levelPlans.push(res);
  });
  Level.getLevel("2", function (err, level) {
      var res = level.name.split("-");
      levelPlans.push(res);
  });
  Level.getLevel("3", function (err, level) {
      var res = level.name.split("-");
      levelPlans.push(res);
  });
  console.log("aqui estan");
  console.log(levelPlans);*/



function ensureAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in!');
        res.redirect('/users/login')
    }
}

module.exports = router;