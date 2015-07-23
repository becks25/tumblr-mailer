/*
	1. Read in CSV file of emails
	2. Get info from tumblr
	3. Populate an email & merge content
	4. Send the email
*/

var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('mQFem5V7VHLJjjRyoxkaeg');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var email = fs.readFileSync('email_template.html').toString();
var emailBottom = fs.readFileSync('email_template_bottom.html').toString();

var parsed_data = csvParse(csvFile);

var today = Date.now();
var oneWeek = 604800000;
var oneWeekAgo = today - oneWeek;
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
		if(curr_post.timestamp >= oneWeekAgo){
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

	for(var i = 0; i<completeEmails.length; i++){
		sendEmail(completeEmails[i].to_name, completeEmails[i].to_email, 'Beckylee', 'dr.oreo@gmail.com','Test Subject', completeEmails[i].message_html);
	}

});


  function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }
