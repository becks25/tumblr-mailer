/*
	1. Read in CSV file of emails
	2. Get info from tumblr
	3. Populate an email & merge content
	4. Send the email
*/

var fs = require('fs');

var csvFile = fs.readFileSync("friend_list.csv","utf8");

csvParse(csvFile);

function csvParse(file){
	var arr = [];

	var splitFile = file.split('\n');

	for(var i = 1; i<splitFile.length -1; i++){
		var info = splitFile[i].split(',');
		arr.push({
			'firstName': info[0],
			'lastName': info[1],
			'numMonthsSinceContact': info[2],
			'emailAddress': info[3]
		});
	}

	console.log(arr);
	return arr;
}