/*
	1. Read in CSV file of emails
	2. Get info from tumblr
	3. Populate an email & merge content
	4. Send the email
*/

var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var email = fs.readFileSync('email_template.html').toString();

var parsed_data = csvParse(csvFile);
//mergeData(email, parsed_data);




for(var i = 0; i<parsed_data.length; i++){
	console.log(ejs.render(email,parsed_data[i]));
}

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

	return arr;
}

function mergeData(email, data){
	var mergedEmail = [];
	var temp = email;
	for(var i=0; i<data.length; i++){
		for(var key in data[i]){
			temp = temp.replace("{{" + key + "}}", data[i][key]);
		}

		mergedEmail.push(temp);

	}

	return mergedEmail;


}