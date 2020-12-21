var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var levels = [];
//var Level = require('../model/levels')


router.get('/', ensureAuthentication, function (req, res) {
    var level1;
    var level2;
    var level3;
    const dbName = 'levels';

    MongoClient.connect("mongodb+srv://andrea:bananas@cluster0.rbcj8.mongodb.net/users?retryWrites=true&w=majority", (err, client) => {
        if (err) { console.log("error") }

        let db = client.db(dbName);
        var collection = db.collection('levels');
        collection.findOne({ name: "1" }, function (err, item) { level1 = item.content; })
        collection.findOne({ name: "2" }, function (err, item) { level2 = item.content; })
        collection.findOne({ name: "3" }, function (err, item) { level3 = item.content; })
        collection.findOne({ name: "3" }, function (err, item) { res.render('index', { lvl1: level1, lvl2: level2, lvl3: level3 }); })

    });





    /*
    Level.getLevel("1", function (err, level) {
        console.log("lvl");
        console.log(level.name);
        /*var res = level.name.split("-");
        levels.push(res);
    });
    Level.getLevel("2", function (err, level) {
        /*var res = level.name.split("-");
        levels.push(res);
    });
    Level.getLevel("3", function (err, level) {
        /*var res = level.name.split("-");
        levels.push(res);
    });*/

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