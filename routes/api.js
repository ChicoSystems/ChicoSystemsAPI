var express = require('express');
var router = express.Router();

router.get('/imgurdl/uses', function(req, res) {
    var db = req.db;
    var collection = db.get('imgurdlUses');
    collection.find({},{},function(e,docs){
        res.render('imgurdlUses', {
            "imgurdlUses" : docs
        });
    });
});

/* GET New User page. */
router.get('/imgurdl/test/adduse', function(req, res) {
    res.render('adduse', { title: 'Add Test Use' });
});

/* POST to Add User Service */
router.post('/imgurdl/adduse', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    //var time = req.body.time;
    var time = Math.floor(new Date() / 1000);
    var term = req.body.term;
    var os = req.body.os;
    var ip = req.connection.remoteAddress;

    // Set our collection
    var collection = db.get('imgurdlUses');

    // Submit to the DB
    collection.insert({
        "time" : time,
        "term" : term,
	"os"   : os,
	"ip"   : ip
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.send("success");
        }
    });
});

module.exports = router;
