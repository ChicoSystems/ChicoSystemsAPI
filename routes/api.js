var express = require('express');
var satelize = require('satelize');
var router = express.Router();

router.get('/imgurdl/distinct', function(req, res, next){
  var db = req.db;
  var collection = db.get('imgurdlUses');
  collection.distinct('ip', {}, {}, function(error, distinct){
    res.send("count: " + distinct.length);
  });
});

router.get('/imgurdl/uses/:page', function(req, res, next){
  var perPage = 100;
  var db = req.db;
  var collection = db.get('imgurdlUses');
  collection.count({}, function(error, count){
    if(error) return next(error);
    var page = req.params.page || Math.ceil(count/perPage);
    collection.find({},{skip: ((perPage * page) - perPage), limit: perPage},function(err, docs){
      collection.distinct('ip', {}, {}, function(er, distinct){
        res.render('imgurdlUses_paged', {
          moment : require('moment'),
          "imgurdlUses" : docs,
          current: page,
          pages : Math.ceil(count/perPage),
          count : count,
          perPage : perPage,
          distinct : distinct.length
        });
      });
    });
    });
});

router.get('/imgurdl/uses', function(req, res) {
  var perPage = 100;
  var db = req.db;
  var collection = db.get('imgurdlUses');
  collection.count({}, function(error, count){
    if(error) return next(error);
    var page = req.params.page || Math.ceil(count/perPage);
    collection.find({},{skip: ((perPage * page) - perPage), limit: perPage},function(err, docs){
      collection.distinct('ip', {}, {}, function(er, distinct){
        res.render('imgurdlUses_paged', {
          moment : require('moment'),
          "imgurdlUses" : docs,
          current: page,
          pages : Math.ceil(count/perPage),
          count : count,
          perPage : perPage,
          distinct : distinct.length
        });
      });
    });
    });
  //  var db = req.db;
  //  var collection = db.get('imgurdlUses');
  //  collection.find({},{},function(e,docs){
//	res.render('imgurdlUses', {
//	    moment : require('moment'),
//            "imgurdlUses" : docs
//        });
//    });
});

router.post('/imgurdl/version', function(req, res) {
    var db = req.db;
    var collection = db.get('imgurVersion');
    collection.find({},{},function(e,docs){
        res.send({"imgurdlVersion" : docs});
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
    var ver = req.body.ver;
    var ip = req.connection.remoteAddress;

    // Set our collection
    var collection = db.get('imgurdlUses');
  console.log("ip: " + ip);
  //if ip is a ipv4 subnet of an ipv6 address, remove ipv6 stuff
  if(ip.substr(0, 7) == "::ffff:"){
    ip = ip.substr(7);
    console.log("ipv4: " + ip);
  }
satelize.satelize({ip: ip}, function(err, payload){

   console.log("payload: " + payload);
   console.log("err: " + err);
   var country = "";
   var timezone = "";
   var latitude = "";
   var longitude = "";
   if(payload == null){
      country = "NA";
	timezone = "NA";
	latitude = "NA";
	longitude = "NA";
   }else{
	country = payload["country_code"];
	timezone = payload["timezone"];
	latitude = payload["latitude"];
	longitude = payload["longitude"];
   }

    // Submit to the DB
    collection.insert({
        "time" : time,
        "term" : term,
	"os"   : os,
	"ip"   : ip,
	"ver"  : ver,
        "country"  : country,
        "latitude" : latitude,
        "longitude" : longitude,
        "timezone" : timezone
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


});

module.exports = router;
