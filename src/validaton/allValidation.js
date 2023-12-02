const mongoose = require('mongoose')

//VALIDATION FOR STRINGS-----
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false;
    return true
}
//VALIDATION FOR CHECK DATA IN REQ BODY-----
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidInputBody = function (object) {
    return Object.keys(object).length > 0
}


//VALIDATION FOR CHARACTERS----
const isValidOnlyCharacters = function (value) {
    return /^[A-Za-z]+$/.test(value)
}

//VALIDATION FOR ADDRESS-----
const isValidAddress = function (value) {
    if (typeof (value) === "undefined" || value === null) return false;
    if (typeof (value) === "object" && Array.isArray(value) === false && Object.keys(value).length > 0) return true;
    return false;
};

//VALIDATION FOR EMAIL-----
const isValidEmail = function (email) {
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexForEmail.test(email);
};

//VALIDATION FOR PHONE NUMBER-----
const isValidPhone = function (phone) {
    const regexForMobile = /^[6-9]\d{9}$/;
    return regexForMobile.test(phone);
};

//VALIDATION FOR PASSWORD-----
const isValidPassword = function (password) {
    const regexForPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
    return regexForPass.test(password);
};

// VALIDATION FOR PIN-CODE-----
const isValidPincode = function (pincode) {
    const regexForPass = /^[1-9][0-9]{5}$/
    return regexForPass.test(pincode);
};

//VALIDATION FOR FILE ONLY IMAGE-----
const isValidImageType = function (value) {
    const regexForMimeTypes = /image\/png|image\/jpeg|image\/jpg/;
    return regexForMimeTypes.test(value)
}

// validation for objectId-----
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)

}
const isValidPrice = function (price) {
    let regexForPrice = /^\d+(\.\d{1,2})?$/
    return regexForPrice.test(price)
};

const isValidInputValue = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length > 0) return true
    return false
}




module.exports = {
    isValidImageType,
    isValidAddress,
    isValidEmail,
    isValidInputBody,
    isValidInputValue,
    isValidOnlyCharacters,
    isValidPassword,
    isValidPhone,
    isValidPincode,
    isValidRequestBody,
    isValid,
    isValidPrice,
    isValidObjectId
}