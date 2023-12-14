// IMPORT USERMODEL MODULE & PACKAGE------
const UserModel = require("../models/userModel");
const AWS = require('aws-sdk')
const bcrypt = require("bcrypt");
const userModel = require('../models/userModel');
const {isValidImageType,isValidAddress,isValidEmail,isValidInputBody,isValidInputValue,isValidOnlyCharacters,isValidPassword,isValidPhone,isValidPincode,isValidRequestBody,isValid} = require('../validaton/allValidation')
const {uploadFile} = require('../helper/awsConfig');
const {sentOtp,genOtp} = require('../middleware/otp');
const client = require('../helper/redisClient')
const dotenv = require('dotenv');
dotenv.config();




//*********************************************USER REGISTRATION******************************************** */

const userRegistration = async function (req, res) {
    try {
        //FETCH DATA FROM REQUEST AND DESTRUCTURING-----
        const requestBody = { ...req.body };
        const queryParams = req.query;
        const image = req.files;

        //NO DATA IS REQUIRE FORM QUERY PAREMS-----
        if (isValidInputBody(queryParams)) {
            return res.status(404).send({ status: false, message: "Page not found" });
        }

        // CHECK REQUEST BODY IS EMPTY OR NOT-----
        if (!isValidInputBody(requestBody)) {
            return res.status(400).send({ status: false, message: "User data is required for registration" });
        }

        //DESTRUCTURING DATA FROM REQUEST BODY-----
        let { fname, lname, email, phone, password, address } = requestBody;

        //EACH KEY VALIDATION STARTS HERE----- 
        if (!isValidInputValue(fname) || !isValidOnlyCharacters(fname)) {
            return res.status(400).send({ status: false, message: "First name is required and it should contain only alphabets" });
        }

        if (!isValidInputValue(lname) || !isValidOnlyCharacters(lname)) {
            return res.status(400).send({ status: false, message: "Last name is required and it should contain only alphabets" });
        }

        if (!isValidInputValue(email) || !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "email address is required and should be a valid email address" });
        }
        //CHEACK GIVEN EMAIL IS UNIQUE----- 
        const notUniqueEmail = await UserModel.findOne({ email });

        if (notUniqueEmail) {
            return res.status(400).send({ status: false, message: "Email address already exist" });
        }

        if (!isValidInputValue(phone) || !isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Phone number is required and should be a valid mobile number" });
        }

        const notUniquePhone = await UserModel.findOne({ phone });

        //CHECK GIVEN PHONE IS UNIQUE------
        if (notUniquePhone) {
            return res.status(400).send({ status: false, message: "phone number already exist" });
        }

        if (!isValidInputValue(password) || !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "password is required and should be of 8 to 15 characters and  must have 1 letter and 1 number" });
        }

        if (!isValidInputValue(address)) {
            return res.status(400).send({ status: false, message: "address is required" });
        }

        //CONVERT ADDRESS INTO OBJECT------ 
        address = JSON.parse(address);

        if (!isValidAddress(address)) {
            return res.status(400).send({ status: false, message: "Invalid address" });
        }

        const { shipping, billing } = address;

        if (!isValidAddress(shipping)) {
            return res.status(400).send({ status: false, message: "Shipping address is required" });
        } else {
            let { street, city, pincode } = shipping;

            if (!isValidInputValue(street)) {
                return res.status(400).send({ status: false, message: "Shipping address: street name is required " });
            }

            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Shipping address: pin code should be valid like: 335659 " });
            }

            if (!isValidInputValue(city)) {
                return res.status(400).send({ status: false, message: "Shipping address: city name is required " });
            }
        }

        if (!isValidAddress(billing)) {
            return res.status(400).send({ status: false, message: "Billing address is required" });
        }
        else {
            let { street, city, pincode } = billing;

            if (!isValidInputValue(street)) {
                return res.status(400).send({ status: false, message: "Billing address: street name is required " });
            }

            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Billing address: pin code should be valid like: 335659 " });
            }

            if (!isValidInputValue(city)) {
                return res.status(400).send({ status: false, message: "Shipping address: city name is required ", });
            }

        }

        if (!image || image.length == 0) {
            return res.status(400).send({ status: false, message: "no profile image found" });
        }

        if (!isValidImageType(image[0].mimetype)) {
            return res.status(400).send({ status: false, message: "Only images can be uploaded (jpeg/jpg/png)" });
        }

        const uploadedProfilePictureUrl = await uploadFile(image[0]);
        if(uploadedProfilePictureUrl.error){
            res.status(500).send({ error: uploadedProfilePictureUrl.error });
        }

        //PASSWORD ENCRYPTION BY USING BCRYPT----- 
        const salt = await bcrypt.genSalt(13);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const userData = {
            fname: fname.trim(),
            lname: lname.trim(),
            email: email.trim(),
            profileImage: uploadedProfilePictureUrl,
            phone: phone.trim(),
            password: encryptedPassword,
            address: address,
        };
        // CREATE DATA IN DATABASE----- 
        const newUser = await UserModel.create(userData);

        res.status(201).send({ status: true, message: "User successfully registered", data: newUser, });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


const login = async function (req, res) {

    try {
        //FETCH DATA FROM REQ.BODY----
        let body = req.body

        // DESTRUCTURING DATA FETCH BY BODY----
        const { email, password } = body

        //VALIDATION FOR CHECK REQUEST BODY IS EMPTY OR NOT----
        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, msg: "pls provide details to login" })
        }

        //VALIDATE EMAIL BY USING REGEX------
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "pls provide valid email" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: `${email} should be a valid email address` })

        }

        // VALIDATE PASSWORD BY USING REGEX------
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "pls provide valid password" })
        }

        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: `Password length should be A Valid Password And Length Should Be in between 8 to 15 ` });

        }

        // MAKE A DB CALL TO FIND DOCUMENT PRESENT WITH GIVEN EMAIL-----
        let user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(400).send({ status: false, msg: "Invalid credentials" })
        }

        //COMPARE PASSWORD PRESENT IN BODY WITH PASSWORD PRESENT IN DOCUMENT OF USER------
        const passwordDetails = await bcrypt.compare(body.password, user.password)
        if (!passwordDetails) {
            return res.status(400).send({ status: false, msg: "password is incorrect pls provide correct passwords" })
        }
        let clientHash = await client.hGetAll(user.phone);
        if(!clientHash.phone){
            clientHash = await client.hSet(user.phone,{
                fname : user.fname,
                lname: user.lname,
                email: user.email,
                phone:user.phone,
                profileImage:user.profileImage,
                address:user.address
            });
        }
       await client.expire(user.phone, 60*15)
        genOtp(req,res,user)
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


const getUser = async function (req, res) {
    try {
        //FETCH USERID FROM THE PARAMS-----
        const userIdInParams = req.params.userId
        //console.log(userIdInParams)
        let decodedToken = req.userId
        //console.log(decodedToken)

        //CHECK USERID GIVEN IN PAREM IS VALID OR NOT-----
        if (userIdInParams.length != 24) {
            return res.status(400).send({ status: false, message: "invalid object id" })
        }

        // COMPARE USERID PRESENT IN PAREMS AND TOKEN-----
        if (decodedToken != userIdInParams) {
            return res.status(403).send({ status: false, message: "User Not authorized!" })
        }

        //MAKE DB CALL TO FIND USER DOCUMENT BY USERID----
        let userDetail = await userModel.findOne({ _id: userIdInParams })
        if (!userDetail) {
            return res.status(400).send({ status: false, message: "User profile not found" })
        }
        res.status(200).send({ status: true, message: "User profile details", data: userDetail })

    } catch (err) {
        return res.status(500).send({ status: false, Message: err.Message })
    }
}

const updateUser = async function (req, res) {
    try {
        //FETCH DATA FROM REQUEST BODY-----
        let data = req.body;

        //FETCH USER ID FROM PARAMS----- 
        const userIdFromParams = req.params.userId;

        //CHECK COJECT ID IS VALID OR NOT-----
        if (userIdFromParams.length != 24) {
            return res.status(400).send({ status: false, message: "invalid object id" })
        }

        //FETCH USER ID PRESENT IN TOKEN BY REQUEST BODY-----
        const userIdFromToken = req.userId;

        if (userIdFromParams != userIdFromToken) {
            return res.status(403).send({ status: false, message: "you are not authorised" })
        }

        //DESTRUCTURING OF DATA-----
        const { fname, lname, email, phone, password, address } = data;

        const updatedData = {}
        const userByuserId = await userModel.findById(userIdFromParams);
        if (!userByuserId) return res.status(404).send({ status: false, message: 'user not found..!!' });
        if (userIdFromToken != userIdFromParams) return res.status(403).send({ status: false, message: "Unauthorized access..!!" })


        //=======================================fname validation=====================================

        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, Message: "First name is invalid..!!" });
            updatedData.fname = fname
        }

        //===================================lname validation==========================================

        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, Message: "Last name is invalid...!!" });
            updatedData.lname = lname
        }

        //================================email validation==============================================

        if (email) {
            if (!(isValidEmail(email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email..!!" });
            const isEmailUsed = await userModel.findOne({ email: email });
            if (isEmailUsed) return res.status(400).send({ status: false, msg: "email must be unique..!!" });
            updatedData.email = email;
        }

        //=======================profile pic upload and validation==========================
        //LEVEL OF CODING IT INDICATES THE DEFICELTY LEVEL I.E FORM 4 TO 14
        let saltRounds = 10;
        const image = req.files;


        if (typeof image !== undefined) {
            if (image && image.length > 0) {
                if (!isValidImageType(image[0].mimetype)) {
                    return res.status(400).send({ status: false, message: "Only images can be uploaded (jpeg/jpg/png)" });
                }

                const profilePic = await uploadFile(image[0]);
                updatedData.profileImage = profilePic;
            }
        }
        //===============================phone validation-========================================

        if (phone) {

            if (!(isValidPhone(phone))) return res.status(400).send({ status: false, msg: "please provide a valid phone number..!!" });

            const isPhoneUsed = await userModel.findOne({ phone: phone });
            if (isPhoneUsed) return res.status(400).send({ status: false, msg: "phone number must be unique..!!" });
            updatedData.phone = phone;
        }

        //======================================password validation-====================================

        if (password) {
            if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required..!!" });
            const encryptPassword = await bcrypt.hash(password, saltRounds);
            updatedData.password = encryptPassword;
        }

        //========================================address validation=================================

        if (address) {

            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, Message: "street name is required..!!" });
                    updatedData["address.shipping.street"] = address.shipping.street;
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, Message: "city name is required..!!" });
                    updatedData["address.shipping.city"] = address.shipping.city;
                }

                if (address.shipping.pincode) {
                    if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, Message: "pincode is required..!!" });
                    updatedData["address.shipping.pincode"] = address.shipping.pincode;
                }
            }

            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, Message: "Please provide street name in billing address..!!" });
                    updatedData["address.billing.street"] = address.billing.street;
                }

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, Message: "Please provide city name in billing address..!!" });
                    updatedData["address.billing.city"] = address.billing.city
                }

                if (address.billing.pincode) {
                    if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, Message: "Please provide pincode in billing address..!!;" })
                    updatedData["address.billing.pincode"] = address.billing.pincode;
                }
            }
        }
        if (Object.keys(updatedData) == 0) {
            return res.status(400).send({ status: false, msg: "please provide data to update..!!" })
        }

        //=========================================update data=============================

        const updatedUser = await userModel.findOneAndUpdate({ _id: userIdFromParams }, updatedData, { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ staus: false, message: err.message });
    }

}
module.exports = { login, getUser, updateUser, userRegistration }
