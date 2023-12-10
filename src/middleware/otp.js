const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();
const client = require('../helper/redisClient');
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

let transporter = nodemailer.createTransport({
	service:'gmail',
	auth: {
		
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
		
	}
});

async function sentOtp(user, otp) {
	try{
		let mailOptions = {
			from: process.env.MAIL_USERNAME,
			to: user.email,
			subject: 'e-Com Login OTP',
		// 	text: `
		// Hi Customer,
		// Use the ${otp}  to login.
		// The code is valid for 15 minutes and can be used only once.
		// `,
		html: `<b><h3>Dear Customer,</h3>

		your one time password(OTP) is :
		<h3>${otp}</h3>

		your OTP will expire in 15min.

		Do not share your OTP with anyone including your Depository participant (DP).
		<br><br>
		<h3>Warm Regards,</h3>
		<h3>E-Com Team.</h3>`
		};
	
		const info = await transporter.sendMail(mailOptions);
	
		if (info){
			return true
		}
	}catch(err){
		console.log(err);
		return ({error:err})
	}
}

async function genOtp(req, res, user) {
	try {
		let otp = Math.floor(Math.random() * 10000);
		console.log("otp is", otp);
		let obj = {
			fname: user.fname,
			lname: user.lname,
			email: user.email,
			phone: user.phone,

		}

		let clientHash = await client.hGetAll(user.phone);
		if (!clientHash.phone) {
			await client.hSet(user.phone, obj);
			clientHash = await client.hGetAll(user.phone)
			await client.expire(user.phone, 60*15)
		}


		if(clientHash.count && parseInt(clientHash.count) > 3){
			return res.status(200).send({
				status: true,
				msg: "max limit reached try again after some time"
			})
		} else {
			if(!clientHash.count){
				clientHash.count = 1
			}else{
				clientHash.count = parseInt(clientHash.count)+1
			}
			clientHash.otp = otp
			await client.hSet(user.phone, clientHash); 
			let mail = await sentOtp(user, otp);
			if(mail.error){
				return res.status(500).send({ status: false, msg: mail.error })
			}
			return res.status(200).send({
				status: true,
				msg: "otp generated successfully",
				otp: otp,
				count: clientHash.count
			})
		}

	} catch (err) {
		console.log(err)
		return res.status(500).send({ status: false, msg: err })
	}
}

async function validateOtp(req,res){
	try{
		const {phone,otp} = req.body;
		let clientHash = await client.hGetAll(phone);

		if(!clientHash){
			return res.status(500).send({ status: false, msg: 'client hash not found'});
		}

		let user = await UserModel.findOne({ email: clientHash.email })
        if (!user) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }

		if(clientHash.otp !== otp){
			return res.status(400).send({ status: false, msg: 'Invalid otp'});
		}
		
		 //GENERATE JWT TOKEN IF EMAIL AND PASSWORD IS CORRECT-----
		 const token = jwt.sign({
            userId: user._id, iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 180
        }, process.env.SECRETKEY)
        //.FLOOR() IS A FUNCTION THAT IS USED TO RETURN THE LARGEST INTEGER----
        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })


	}catch(err){
		console.log(err)
	}
}


module.exports = {
	sentOtp,
	genOtp,
	validateOtp
}