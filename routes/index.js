var express = require('express');
var router = express.Router();
var request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; NODE_TLS_REJECT_UNAUTHORIZED=0

function addSlashes( str ) {
//    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')k;
	str = str.replace(/\\n/g, "\\n")  
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
    return (str + '').replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');

}
var workingRecords = [];
var globalRecordNum = 0;
var db;
var collection;
//var token =  'Token ZdlVUz79qRtZ'; //itravers
//var token =  'Token NX8XGywpH4tT';  //isaac
//var token =  'Token Y8U6VaU7Ss1S';  //isaac1
//var token =  'Token kFEeJ7GngL9I';  //isaac2
//var token =  'Token lk2394B0WKVq';  //isaac3
//var token =  'Token M4LK7r55C93z';  //isaac4
//var token =  'Token 6piKN7jDmtre';  //isaac5
//var token =  'Token zA4m643x4hNR';  //isaac6
//var token =  'Token qrxYBER7J9ln';  //isaac7
//var token =  'Token IrPwW5WoHL5O';  //isaac8
//var token =  'Token 14uC9Pgf6bqj';  //isaac9
//var token =  'Token YyQqYrVfL5sp';  //isaac10
//var token =  'Token TiCOE79wOUeW';  //isaac11
//var token =  'Token cTtnoyUWISHP';  //isaac12
//var token =  'Token cEYDndIqDxMV';  //isaac13
//var token =  'Token hkZD2twIAMlU';  //isaac14
var token =  'Token Xuuzq4feWowd';  //isaac15

//var token =  'Token YHYlEPYxgLwQ';  //confusedvirtuoso
//var token =  'Token iXcQ55mhlVYE';  //personsaddress
//var token =  'Token a42MP0XPJqdQ';  //ourautodidact


router.get('/quizbowl/category', function(req, res){
	var db = req.db_quizbowl;
	var collection = db.get('questions');

	collection.distinct('category', {}, {}, function(e, docs){
		res.render('quizCategory', {
			"category" : docs
		});
	});
});

router.get('/quizbowl/category/:catName', function(req, res) {
    var db = req.db_quizbowl;
    var catName = req.params.catName;
    var collection = db.get('questions');
    collection.find({"category" : catName},{},function(e,docs){
        res.render('viewcategory_quizbowl', {
            "questions" : docs
        });
    });
});



//display info about walmart stores
router.get('/walmart', function(req, res){
	var db = req.db_walmart;

	var collection = db.get('stores');
	collection.findOne({},{}, function(e, docs){
		res.send(docs);
	});
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/category', function(req, res) {
    var db = req.db_quizgame;
    var collection = db.get('jQuestions');
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

router.get('/show/:showNum', function(req, res){
	var db = req.db_quizgame;
	var showNum = req.params.showNum;
	var collection = db.get('jQuestions');
	collection.find({"show_number" : showNum},{}, function(e, docs){
		res.render('viewshownum', {
			"questions" : docs
		});
	});
});

router.get('/discipline/:discipline', function(req, res){
	var db = req.db_quizgame;
	var discipline = req.params.discipline;
	var collection = db.get('jQuestions');
	collection.find({"discipline" : discipline},{}, function(e, docs){
		res.render('viewdiscipline', {
			"questions" : docs
		});
	});
});

router.get('/subdiscipline/:subdiscipline', function(req, res){
	var db = req.db_quizgame;
	var subdiscipline = req.params.subdiscipline;
	var collection = db.get('jQuestions');
	collection.find({"subDiscipline" : subdiscipline},{}, function(e, docs){
		res.render('viewsubdiscipline',{
			"questions" : docs
		});
	});
});

router.get('/answer/:answer', function(req, res){
	var db = req.db_quizgame;
	var answer = req.params.answer;
	var collection = db.get('jQuestions');
	collection.find({"answer" : answer},{}, function(e, docs){
		res.render('viewanswer', {
			"questions" : docs
		});
	});
});

router.get('/category/:catName', function(req, res) {
    var db = req.db_quizgame;
    var catName = req.params.catName;
    var collection = db.get('jQuestions');
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
                        //'Authorization' : 'Token ZdlVUz79qRtZ'
                        'Authorization' : token
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
	var db = req.db_quizgame;
	var catName = req.params.catName;
	var collection = db.get('jQuestions');
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

//6 didn't work, lets try 7
router.get('/classify7/:catName', function(req, res){
	workingRecords = [];
	db = req.db_quizgame;
	var catName = req.params.catName;
	collection = db.get('jQuestions');

	collection.find({"category" : catName},[],function(e, docs){


		//use only working records that have a discpiline, and no subDiscipline
		for(i in docs){
			var singleRecord = docs[i];
			if(singleRecord.hasOwnProperty('discipline') && !singleRecord.hasOwnProperty('subDiscipline')){
				console.log("record " + i + " has disclipine, but no subDiscipline... adding to workingRecords[]");
				workingRecords.push(singleRecord);
			}
		}


		classifyRequest(0);		
		res.send(workingRecords);
		//


	}); //end db query
});//end router


function getClassifier(discipline){
	var returnVal = "";
		if(discipline == "Arts"){
                    returnVal = "art-topics";
                }else if(discipline == "Business"){
                    returnVal = "business-topics";
                }else if(discipline == "Computers"){
			returnVal = "computer-topics";
                }else if(discipline == "Games"){
                        returnVal = "game-topics";
                }else if(discipline == "Health"){
                        returnVal = "health-topics";
                }else if(discipline == "Home"){
                        returnVal = "home-topics";
                }else if(discipline == "Recreation"){
                        returnVal = "recreation-topics";
                }else if(discipline == "Science"){
                        returnVal = "science-topics";
                }else if(discipline == "Society"){
                        returnVal = "society-topics";
                }else if(discipline == "Sports"){
                        returnVal = "sport-topics";
                }
	return returnVal;
}

function classifyRequest(recordNum){
	globalRecordNum = recordNum; //used to give callback access to current recordNum
	var post_data = '{"texts":[';
  if(workingRecords == null || workingRecords[recordNum] == null) return 0;
	var newString = workingRecords[recordNum]["question"];
	newString = addSlashes(newString);
	post_data += '" ';
	post_data += addSlashes(workingRecords[recordNum]["category"]);
	post_data += " ";
	post_data += newString;
	post_data += " ";
	post_data += addSlashes(workingRecords[recordNum]["answer"]);
	post_data += '"';
	post_data += ']}';
  post_data = JSON.parse(post_data);
	console.log("post_data: " + post_data);
	var classifer = getClassifier(workingRecords[recordNum]["discipline"]);
	var url = "https://api.uclassify.com/v1/uClassify/" + classifer + "/classify";
	console.log("url: " + url);
	console.log("will make actuall request next");
	//classifyCallback(null, null, null);
	
	request(
		{
			url: url,
			method: "POST",
			json: true,
			headers: {
                        	'Content-Type' : 'application/json',
                                //'Authorization' : 'Token ZdlVUz79qRtZ'
                                'Authorization' : token
                        },
                        body: post_data
		},
		classifyCallback
	);
}

function classifyCallback(error, response, body){
	console.log("classifyCallbackCalled on recordNum: " + globalRecordNum);
	console.log("workingRecords.length == " + workingRecords.length);
	
	//if this is last of working records, we don't do anything, else, we do callback work
	if(globalRecordNum == workingRecords.length){
		console.log("we are done processing records");
	}else{
		console.log("processing this record, and calling next");
		//write to db here, and call classifyRequest(globalRecordNum + 1 in callback);

		//loop through response, find best matching subDiscipline for each text
		if(error == null){
			console.log("body.length == " + body.length);
			var bestSubDiscipline;
			for(i in body){
				var largestPNum = 0;
				var largestPIndex = 0;
				//loop through each item in each classification, find biggest p and choose that className as bestSubDiscipline
				for(j in body[i]["classification"]){
					var pNum = body[i]["classification"][j]["p"];
					if(pNum > largestPNum){
						largestPNum = pNum;
						largestPIndex = j;
					}
				}
				bestSubDiscipline = body[i]["classification"][largestPIndex]["className"];
			}
			//body.length should always == 1
			if(body.length != 1){
				console.log("error, body.length should always == 1");
			}else{
				// here we write our new subDiscipline to the local db, and then call classifyRequest(globalRecordNum +1)
				console.log("best subDiscipline : " + bestSubDiscipline);
				var id = workingRecords[globalRecordNum]["_id"];

				console.log("updating local record: " + id);
				//var db = req.db;
				//var collection = db.get('questions'); //collections was undefined
				collection.update(
					{"_id" : id},
					{"$set" : {"subDiscipline" : bestSubDiscipline }},
					function(err, result){
						if(err) throw err;
						console.log("record updated, processing next");
						classifyRequest(globalRecordNum + 1);
					}
				);
			}
		}else{
			console.log("There was an error: " + error);
		}


		//classifyRequest(globalRecordNum + 1);
	}
}


//classifies the subdisciplines of all questions in a category, whose disciplines have already been classified.
router.get('/classify6/:catName', function(req, res){
	var db = req.db_quizgame;
	var catName = req.params.catName;
	var collection = db.get('jQuestions');
	
    //First we query the local db for all records with the given category, that also have a discipline associated, but don't have a subdiscipline.
    collection.find({"category" : catName}, {}, function(e, docs){
		//only use workingRecords that have a discipline associated
		for(i in docs){
			//test if record has a discipline field && does not have a subDiscipline field it does add it to working records, otherwise ignore it.
			var singleRecord = docs[i];
			if(singleRecord.hasOwnProperty('discipline') && !singleRecord.hasOwnProperty('subDiscipline')){
				console.log("record " + i + " has discipline, but no subDiscipline... adding to workingRecords[]");
				workingRecords.push(singleRecord);
			}
		}

	//We translate the given discipline to it's matching subclassifier on uClassify
	
	//create a new array which holds the subclassifier name in the same order as the workingRecords[] array.
	var classifierName = [];
	for(i in workingRecords){
		var discipline = workingRecords[i]["discipline"];
		//the following disciplines are possible: Arts, Business, Computers, Games, Health, Home, Recreation, Science, Society, Sports
		if(discipline == "Arts"){
			classifierName.push("art-topics");
		}else if(discipline == "Business"){
			classifierName.push("business-topics");
		}else if(discipline == "Computers"){
			classifierName.push("computer-topics");
		}else if(discipline == "Games"){
			classifierName.push("game-topics");
		}else if(discipline == "Health"){
			classifierName.push("health-topics");
		}else if(discipline == "Home"){
			classifierName.push("home-topics");
		}else if(discipline == "Recreation"){
			classifierName.push("recreation-topics");
		}else if(discipline == "Science"){
			classifierName.push("science-topics");
		}else if(discipline == "Society"){
			classifierName.push("society-topics");
		}else if(discipline == "Sports"){
			classifierName.push("sport-topics");
		} 
	}

	//For every seperate discipline, we create an api call to uclassify asking it to classify the subdisciplines.
	//for now we'll just make a seperate call for each question, this can be changed later, it'll take to long to code now.

	for(i in workingRecords){
		

//	if(i == 0){
	//	var i = 0;
		//create an api call for each record
		var post_data = '{"texts":['; //start the post_data string
		var newString = workingRecords[i]["question"];
		
		//the api can't parse the json if there are unescaped special charaters
		newString = addSlashes(newString);

		//add quotes before and after the string
		post_data += '"';
		post_data += newString;
		post_data += '"';

		//no commas are needed here, because we are only querying one text at a time.

		//add end to post_data string
		post_data += ']}';
    post_data = JSON.parse(post_data);
		console.log("post_data: " + post_data);
		
		var url = "https://api.uclassify.com/v1/uClassify/" + classifierName[i] + "/classify";
		//var url = "https://api.uclassify.com/v1/uClassify/Topics/classify";
		console.log("url: " + url);


		request(
			{
				url: url,
				method: "POST",
				json: true,
				headers: {
					'Content-Type' : 'application/json',
		                      	//'Authorization' : 'Token ZdlVUz79qRtZ'
		                      	'Authorization' : token
				},
				body: post_data
			}, function(error, response, body){
				console.log("uclassify returned workingRecord["+i+"]");
				console.log("error: " + error + " response: " + response + " body: " + JSON.stringify(body));
		//		console.log("request returned: error: " + error + " response: " + JSON.stringify(response) + " body: " + JSON.stringify(body));
//				res.send(JSON.stringify(body));
			}
		);



}

		//send post with post_data, using the correct classifier to uClassify
/*		request({
			url: url,
			method: "POST",
			json: true,
			headers: {
                        	'Content-Type' : 'application/json',
                        	'Authorization' : 'Token ZdlVUz79qRtZ'
                        },
			body: post_data
		}, function(error, response, body){
			console.log("response from uClassify, body: " + JSON.stringify(body) + " response: " + JSON.stringify(response) + " error: " + error);
			//loop through response, find best matching subDiscipline for each text
			var bestSubDiscipline;
			for(k in body){
				var largestPNum = 0;
				var largestPIndex = 0;

				//loop through each item in each classification, find biggest p and add that className to the bestSubDiscipline array
				for(j in body[k]["classification"]){
					var pNum = body[k]["classification"][j]["p"];
					if(pNum > largestPNum){
						largestPNum = pNum;
						largestPIndex = j;
					}
				}	
				bestSubDiscipline = body[k]["classification"][largestPIndex]["className"];
			}
			
			console.log("Best subDiscipline: " + bestSubDiscipline);

			//update the current working record with the given subDiscipline
			var id = workingRecords[i]["_id"];
			console.log("updating record: " + id + " with subDiscipline: " + bestSubDiscipline);

			collection.update(
				{"_id" : id},
				{"$set" : {"subDiscipline" : bestSubDiscipline}}
			);

			res.render('viewcategory', {
				"questions" : docs
			});


		});//end request
*/
//	}//endif i == 0

		
//	}

    });//end db query


	
});//end router


//classifies the disciplines of all questions in a category, that have not yet been classified.
router.get('/classify4/:catName', function(req, res){
	//query local db for a set of questions
	var db = req.db_quizgame;
	var catName = req.params.catName;
	var collection = db.get('jQuestions');
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
			post_data += ' ';
			post_data += addSlashes(workingRecords[i]["category"]);
			post_data += ' ';
			post_data += newString;
			post_data += ' ';
			post_data += addSlashes(workingRecords[i]["answer"]);
			post_data += ' ';
			post_data += '"';	
			
			//add comma to string if this is not the last item in working records
			if(workingRecords.length - 1 != i){
				post_data += ',';
			}
		}	
		//add end to post_data
		post_data += ']}';

		console.log("postDataString: " + post_data);

    post_data = JSON.parse(post_data);
	
		console.log("postData: " + post_data);
	
		//send post with post_data to uClassify api	
		request({
                url: "https://api.uclassify.com/v1/uClassify/Topics/classify",
                method: "POST",
                json: true,
                 headers: {
                        'Content-Type' : 'application/json',
                        //'Authorization' : 'Token ZdlVUz79qRtZ'
                        'Authorization' : token
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
			if(body != null && body[i] != null && body[i]["classification"] != null){ 	
				bestCategory.push(body[i]["classification"][largestPIndex]["className"]);
		}else{
			return 0;
		}
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
	
                          if(i == docs.length -1){
	                          res.render('viewcategory', {
	                             "questions" : docs
	                          });
                          }


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
			//'Authorization' : 'Token ZdlVUz79qRtZ'
			'Authorization' : token
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
