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
});

router.post('/imgurdl/version', function(req, res) {
    var db = req.db;
    var collection = db.get('imgurVersion');
    collection.find({},{},function(e,docs){
        res.send({"imgurdlVersion" : docs});
    });
});



/* POST to Add User Service */
router.post('/mare/adduse', function (req, res) {
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    //var time = req.body.time;
    var time = Math.floor(new Date() / 1000);
    var computer = req.body.computer;
    var os = req.body.os;
    var ver = req.body.ver;
    var ip = req.connection.remoteAddress;
    var appName = req.body.appName;
    var notes = req.body.notes;
    var username = req.body.username;

    // Set our collection
    var collection = db.get('mareUses');
    //console.log("ip: " + ip);
    //if ip is a ipv4 subnet of an ipv6 address, remove ipv6 stuff
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
        //console.log("ipv4: " + ip);
    }

    // Submit to the DB
    collection.insert({
        "time": time,
        "os": os,
        "ip": ip,
        "ver": ver,
        "appName": appName,
        "computer": computer,
        "notes": notes,
        "username": username
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



// Called when an http post request is made for a mare app version
router.get('/mare/version/:appName', function (req, res) {

    // This is our main mongo db
    var db = req.db;

    // The user will pass the requested appName in the api request
    var appName = req.params.appName;

    // we save our app version information in the mareVersion collection
    var collection = db.get('mareVersion');
    collection.find({ "appName": appName }, {}, function (e, docs) {
        res.send({ "appVersion": docs });
    });
});

//displays the update version form allowing admin to update
//the current imgurdl version
router.get('/imgurdl/updateversion', function(req, res){
  var db = req.db;
  var collection = db.get('imgurVersion');
  collection.find({}, {}, function(e, docs){
    res.render('updateversion', {
      docs : docs
    });
  });
});


//backend of the update version page
//takes the version and link admin submitted and
//updates the db
router.post('/imgurdl/setversion', function(req, res){
  var ver = req.body.version;
  var link = req.body.link;
  console.log("Version updated: " + ver);
  console.log("Link updated: " + link);
  var db = req.db;
  var collection = db.get('imgurVersion');
  collection.update({}, {$set: {ver: ver, link: link}}, function(err, response){

    var message = '';
    if(!err){
      message = {type: 'success', message: "Version Updated to : " + ver};
    }else{
      message = {type: "danger", message: err};
    }
    res.send(message);
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
