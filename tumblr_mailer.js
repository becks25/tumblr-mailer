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
var emailBottom = fs.readFileSync('email_template_bottom.html').toString();

var parsed_data = csvParse(csvFile);

var today = Date.now();
var oneWeek = 604800000;
var oneWeekAgo = today;
var completeEmails = [];

//parse through the contact list
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

// Authenticate via API Key
var client = tumblr.createClient({ consumer_key: 'UL8b8cY1B2MCAcRDRDunbNRW0yjGZmpzMcuHu192OI2gEtXJhq' });

// Get info for all posts made in the last week
client.posts('beckyleedell.tumblr.com', function (err, data) {
	var posts = [];
	for(var i = 0; i < data.posts.length; i++){
		var curr_post = data.posts[i];
		if(curr_post.timestamp <= oneWeekAgo){
			posts.push({
				'href': curr_post.post_url,
				'title': curr_post.title
			});
		}
	}

	for(var i = 0; i<posts.length; i++){
		emailBottom = ejs.render(emailBottom, posts[i]);
	}

	//attach the rendered bottom of the email to the top!
	email = email + emailBottom;

	//create an array of objects of all the completed info
	for(var i = 0; i<parsed_data.length; i++){
		completeEmails.push({
			'message_html' : ejs.render(email,parsed_data[i]),
			'to_name': parsed_data[i].firstName,
			'to_email': parsed_data[i].emailAddress
		});
	}

	console.log(completeEmails);

});



