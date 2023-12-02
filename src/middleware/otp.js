const nodemailer = require('nodemailer');


let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'pc75805@gmail.com',
		pass: 'Hanuman@19'
	}
});

let mailDetails = {
	from: 'pc75805@gmail.com',
	to: 'prince.chouhan@oriserve.com',
	subject: 'Test mail',
	text: 'Node.js testing mail for prince chouhan'
};

mailTransporter.sendMail(mailDetails, function(err, data) {
	if(err) {
		console.log('Error Occurs');
	} else {
		console.log('Email sent successfully');
	}
});
