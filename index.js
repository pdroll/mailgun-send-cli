var creds = require('./creds.json');
var mailgun = require('mailgun-js')({apiKey: creds.mailgun.apikey, domain: creds.mailgun.domain});
var mailcomposer = require('mailcomposer');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var htmlEmail = '';

// Fetch HTML Email based on args
if(argv.emailname) {
	htmlEmail = fs.readFileSync('./emails/' + argv.emailname + '.html', 'utf8');
} else if(argv.emailpath) {
	htmlEmail = fs.readFileSync( argv.emailpath , 'utf8');
}

var from = argv.from || 'droll.p@gmail.com';
var subject = argv.subject || 'Test Email Send';

var mail = mailcomposer({
	from: from,
	to: argv.to,
	subject: subject,
	body: 'Test email sned',
	html: htmlEmail
});

mail.build(function(mailBuildError, message) {

	var dataToSend = {
		to: argv.to,
		message: message.toString('ascii')
	};

	mailgun.messages().sendMime(dataToSend, function (sendError, body) {
		if (sendError) {
			console.log(sendError);
			return;
		}
		console.log('Successfull sent to ' +  argv.to);
	});
});
