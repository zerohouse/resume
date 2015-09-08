var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'parksungho86@gmail.com',
        pass: 'qkrtjdgh1!'
    }
});

var mailOptions = {
    from: 'Fred Foo ✔ <parksungho86@gmail.com>', // sender address
    to: 'parksungho86@gmail.com',
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});