$( document ).ready(function() {
    console.log( 'ready! : ' + info);
	console.log('use: ' + info[info.length-1]['longitude']);
	var latArray = new Array();
	var longArray = new Array();
	for(var i = 0; i < info.length; i++){
		var longitude = info[i]['longitude'];
		var latitude =  info[i]['latitude'];
		if(longitude != undefined && longitude != "NA"){
			console.log("use #" + i + ": " + longitude + " " + latitude);
			latArray.push(latitude);
			longArray.push(longitude);
		}
	}
	$('#map').attr("src", getMap(latArray, longArray));
});

function getMap(latArray, longArray){
	var mapString = 'http://maps.google.com/maps/api/staticmap?center=Atlantic+Ocean&zoom=2&size=1024x1024&maptype=satellite&markers=color:red';

	for(var i = 0; i < latArray.length; i++){
		mapString += '|'+latArray[i]+ ","+longArray[i]
		
	}

	mapString += '&sensor=false&key=%20AIzaSyAKbnC4fMS_jN02knU3Xm9yC2vnTSZtCVA';
	console.log("mapString: " + mapString);
	return mapString;
//	return 'http://maps.google.com/maps/api/staticmap?center=Atlantic+Ocean&zoom=2&size=1024x1024&maptype=satellite&markers=color:red|label:66|41.8847,-88.204&markers=color:green|label:148|-23.4733,-46.6658&markers=color:red|label:172|40.4148,-74.2296&sensor=false&key=%20AIzaSyAKbnC4fMS_jN02knU3Xm9yC2vnTSZtCVA';
}
