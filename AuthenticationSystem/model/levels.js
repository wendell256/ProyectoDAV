var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Schema

var LevelSchema = mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    content: {
        type: String,
    },

});

var Level = module.exports = mongoose.model('Level', LevelSchema);


module.exports.getLevel = function (levelname, callback) {
    var query = { name: levelname };
    Level.findOne(query, callback);
}


