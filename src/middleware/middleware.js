// IMPORT JSONWEBTOKEN PACKAGE-------
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();
// IMPORT USERMODEL FOR DB CALLS-----
const userModel = require("../models/userModel")


const authentication =  (req, res, next) => {
    try {
        let barer = req.headers["Authorization"];
        if (!barer) barer = req.headers["authorization"];
        if (!barer) {
            return res.status(400).send({ status: false, msg: "Token required! Please login to generate token" });
        }
        
        const splitToken = barer.split(' ');
        const token = splitToken[1];

        let tokenValidity = jwt.decode(token, process.env.SECRETKEY);
        let tokenTime = (tokenValidity.exp) * 1000;
        let CreatedTime = Date.now()
       
        if (CreatedTime > tokenTime) {
            return res.status(400).send({ status: false, msg: "token is expired, login again" })
        }

        const decoded =  jwt.verify(token,  process.env.SECRETKEY);
        if(!decoded) {
            return res.status(403).send({status: false, message: `Invalid authentication token in request`})  
        }

        //set token userid in request body----
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(500).send({status: false, message: error.message})
    }
}


// const authorization=async (req, res, next)=>{
//     try{
//     //FETCH TOKEN FROM HEADER----
//     let token = req.headers["x-auth-token"||"X-Auth-Token"]
//     if (!token) {
//      return   res.status(400).send({ status:false,message: "no token found" })
//     }

//     // DECODE TOKEN FETCH BY FROM HEADER----
//     let decodedToken = jwt.verify(token,  process.env.SECRETKEY)
//     if(!decodedToken){
//       return  res.staus(401).send({status:false,message:"Invalid token"})
//     }
//     // FETCH BOOK ID PRESENT IN PARAMS----
//     let urlInParams = req.params.userid

//     //VALIDATION FOR OBJECT ID -----
//     let isValid = mongoose.Types.ObjectId.isValid(urlInParams);
//     if(!isValid){
//         return res.status(400).send({status:false, message:"invalid userid"})
//     }

//     // FIND BOOK DOCUMENT BY BOOK ID-----
//     let User = await userModel.findOne({_id:urlInParams})
    
//     if(!User){
//       return  res.status(404).send({status:false, message:  `No user found with given Id ${Id}` })
//     }

//     // MATCH THE USER-ID PRESENT IN TOKEN AND USER-ID PRESENT IN BOOK-ID-----
//     if(decodedToken.userId != User._id){
       
//        return res.status(403).send({status:false, message:"User Not authorized!" })
//     }
//     next()
// }catch(err){
//     res.status(500).send({status:false,message:err.message})
// }
// }

// MAKE MODULE PUBLIC AND EXPORT FROM HERE-----
module.exports={authentication}
