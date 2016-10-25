var express = require('express');
var router = express.Router();
var request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; NODE_TLS_REJECT_UNAUTHORIZED=0

function addSlashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/category', function(req, res) {
    var db = req.db;
    var collection = db.get('questions');
   // collection.find({"category" : "SCIENCE"},{},function(e,docs){
    //    res.render('category', {
    //        "category" : docs
    //    });
    //});
    collection.distinct('category', {}, {}, function(e, docs){
	res.render('category', {
		"category" : docs
	});
    });
});


router.get('/category/:catName', function(req, res) {
    var db = req.db;
    var catName = req.params.catName;
    var collection = db.get('questions');
    collection.find({"category" : catName},{},function(e,docs){
        res.render('viewcategory', {
            "questions" : docs
        });
    });
});


//makes api call
router.get('/classify2', function(req, res){
	var jsonData = '{"texts":["Nearly twice as sweet as sucrose, this fruit sugar is the main sweetener in honey", "These electromagnetic rays used to take pictures of your insides were originally known as Roentgen rays"]}';

	request({
		url: "https://api.uclassify.com/v1/uClassify/Topics/classify",
		method: "POST",
		json: true,
		 headers: {
                        'Content-Type' : 'application/json',
                        'Authorization' : 'Token ZdlVUz79qRtZ'
                	},
		body: jsonData
		}, function(error, response, body){
			console.log(JSON.stringify(response) + " body: " + JSON.stringify(body) + " error: " + error);
			//res.send("response: " + JSON.stringify(response) + " body: " + JSON.stringify(body) + " error: " + error);
			res.render('classify', {
				"response" : response,
				"body" : body,
				"error" : error
			});

	});	
});

//test the end step in our api call, where we update the db with items gotten from the uClassify api
router.get('/classify5/:catName', function (req, res){
	var db = req.db;
	var catName = req.params.catName;
	var collection = db.get('questions');
	collection.find({"category" : catName},{}, function(e, docs){
		var workingRecords = [];
                //parse question texts into proper post_data and send to uclassify api
                for(i in docs){
                        //test if record already has "discipline" key if it does, ignore it, if not add to records var
                        var singleRecord = docs[i];
                        if(singleRecord.hasOwnProperty('discipline')){
                                console.log("item has property");
                        }else{
                                console.log("item DOESN:T HAVE PROPERTY");
                                workingRecords.push(singleRecord);
                        }
                }
		
		var bestCategory = ["Arts", "Arts", "Society", "Arts", "Society"];

		//write to db, adding field "discipline" to each corresponding item
		for(i in docs){
			var id = docs[i]["_id"];
			console.log("updating record: " + id + " with discipline: " + bestCategory[i]);
			
		//	if(i == 0){

			//this is updating the _id with a discipline, but it is erasing all other record info
			collection.update(
				{"_id" : id},
				{"$set" : {"discipline" : bestCategory[i]}}
			);

			res.render('viewcategory', {
		            "questions" : docs
		        });
			


		//	}
		}


	});
	
});

router.get('/classify4/:catName', function(req, res){
	//query local db for a set of questions
	var db = req.db;
	var catName = req.params.catName;
	var collection = db.get('questions');
	collection.find({"category" : catName},{},function(e,docs){
		//res.send(docs);

		var workingRecords = [];
		//parse question texts into proper post_data and send to uclassify api
		for(i in docs){
			//test if record already has "discipline" key if it does, ignore it, if not add to records var
			var singleRecord = docs[i];
			if(singleRecord.hasOwnProperty('discipline')){
				console.log("item has property");
			}else{
				console.log("item DOESN:T HAVE PROPERTY");
				workingRecords.push(singleRecord);
			}
		}


		//build post_data string from questions in records
		var post_data = '{"texts":[';
		for(i in workingRecords){
			var newString = workingRecords[i]["question"];
	
			//the api can't parse the json if there is a quote mark unescaped
			//so we need to find any quote marks in newString and escape them
			console.log("without slashes: " + newString);
			newString = addSlashes(newString);
			console.log("with slashes: " + newString);


			post_data += '"';
			post_data += newString;
			post_data += '"';	
			
			//add comma to string if this is not the last item in working records
			if(workingRecords.length - 1 != i){
				post_data += ',';
			}
		}	
		//add end to post_data
		post_data += ']}';
	
		console.log("postData: " + post_data);
	
		//send post with post_data to uClassify api	
		request({
                url: "https://api.uclassify.com/v1/uClassify/Topics/classify",
                method: "POST",
                json: true,
                 headers: {
                        'Content-Type' : 'application/json',
                        'Authorization' : 'Token ZdlVUz79qRtZ'
                        },
                body: post_data
                }, function(error, response, body){
                        console.log("response from uClassify body:" + JSON.stringify(body) + " response: " + response + " error " + error);
			//loop through response, find best matching category for each text		
			var bestCategory = [];
			for(i in body){
				var largestPNum = 0;
				var largestPIndex = 0;
				//loop through each item in each classification, find piggest p and add 
				//that className to the bestCategory array
				for(j in body[i]["classification"]){
					var pNum = body[i]["classification"][j]["p"];
					if(pNum > largestPNum){
						largestPNum = pNum;
						largestPIndex = j;
					}
				}
				
				bestCategory.push(body[i]["classification"][largestPIndex]["className"]);
			}

			console.log("the following are the best categories for each question, in order");
			for(i in bestCategory){
				console.log(bestCategory[i]);
			}
			

			//write new "discipline" field to each corresponding item in the db
			//write to db, adding field "discipline" to each corresponding item
	                for(i in docs){
	                        var id = docs[i]["_id"];
	                        console.log("updating record: " + id + " with discipline: " + bestCategory[i]);
	
	                //      if(i == 0){
	
	                        //this is updating the _id with a discipline, but it is erasing all other record info
	                        collection.update(
	                                {"_id" : id},
	                                {"$set" : {"discipline" : bestCategory[i]}}
	                        );
	
	                        res.render('viewcategory', {
	                            "questions" : docs
	                        });



                //      }
                }
	
        	});


		
	


	});





	//loop through response, find best matching category for each text



	//write new "discipline" field to each cooresponding item in the db


});

//demo json_response has already been built, this will find each discipline for each item in the json_response array
router.get('/classify3', function(req, res){
	//res.send("this is classify3");
	var json_response = '[{"textCoverage":0.714286,"classification":[{"className":"Arts","p":0.0388955},{"className":"Business","p":0.0526065},{"className":"Computers","p":0.018725},{"className":"Games","p":0.0437801},{"className":"Health","p":0.181598},{"className":"Home","p":0.420186},{"className":"Recreation","p":0.102792},{"className":"Science","p":0.0988786},{"className":"Society","p":0.0275971},{"className":"Sports","p":0.0149414}]},{"textCoverage":0.8,"classification":[{"className":"Arts","p":0.0326213},{"className":"Business","p":0.0204032},{"className":"Computers","p":0.0392646},{"className":"Games","p":0.0353883},{"className":"Health","p":0.345859},{"className":"Home","p":0.0432475},{"className":"Recreation","p":0.0318659},{"className":"Science","p":0.383476},{"className":"Society","p":0.0102013},{"className":"Sports","p":0.0576729}]}]';

	json_response = JSON.parse(json_response);

	for(i in json_response){
		console.log(" i = "+i);
		var largestPNum = 0;//the actuall p num
		var largestPIndex = 0; //the index j that the largest pnum is in

		//loop through each item in classification, find the biggest p, and return that className
		for(j in json_response[i]["classification"]){
		//	console.log("className: " + json_response[i]["classification"][j]["className"]);
		//	console.log("p: " + json_response[i]["classification"][j]["p"]);
			var pNum = json_response[i]["classification"][j]["p"];
			if(pNum > largestPNum){
				largestPNum = pNum;
				largestPIndex = j;
			}

		}

			console.log("most likely discipline for text #" + i + " is: " + json_response[i]["classification"][largestPIndex]["className"]);
			console.log("pNum: " + json_response[i]["classification"][largestPIndex]["p"]);

		
	}


	res.render('classify', {
		"response" : json_response,
	});
	
});


router.get('/classify', function(req, res) {
//	var question = "Nearly twice as sweet as sucrose, this fruit sugar is the main sweetener in honey";
//	console.log("making request: " + question);

	//setup the data
	var post_data = '{"texts":["Nearly twice as sweet as sucrose, this fruit sugar is the main sweetener in honey", "These electromagnetic rays used to take pictures of your insides were originally known as Roentgen rays"]}';

	//setup the request options
	var options = {
		host : 'https://api.uclassify.com',
		path : '/v1/itravers/topics/classify',
		method : 'POST',
		headers: {
			'Content-Type' : 'application/json',
			'Authorization' : 'Token ZdlVUz79qRtZ'
		}
	}
	console.log("options: " + options);

	//set up the request
	var post_req = http.request(options, function(res) {
//		res.setEncoding('utf8');
//		res.on('data', function(chunk) {
//			console.log('response: ' + chunk);
//		});
	});

	//console.log("post_req: " + JSON.stringify(post_req));

	//post the data
	//post_req.write(post_data);
	//post_req.end();


});


module.exports = router;
