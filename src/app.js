// IMPORT EXPRESS PACKAGE( COMMOM JS SYNTEX )------
const express = require('express');
const client = require('./helper/redisClient')
// INSTATIATE THE EXPRESS APP------
const app = express()
const dotenv = require('dotenv');
dotenv.config();
// IMPORT MULTER PACKAGE------
const multer = require("multer")
const { AppConfig } = require('aws-sdk');

//IMPORT BODY PARESR PACKAGE-----
const bodyParser = require('body-parser')

// IMPORT ROUTE MODULE------
const route = require('./routes/route');
const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(multer().any())


// DECLARE  A DATABASE STRING URL----
mongoose.connect(process.env.MONGOURL,
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then( () => console.log("mongoDB is connected"))
.catch ( err => console.log(err))

// APP SET THEIR ENDPOINT IN ROUTE.JS----
app.use('/pay', function (req,res){
    res.sendFile(__dirname + "/index.html");
})
app.use('/',route)


//CHECKING FOR INCORRECT ENDPOINTS-----
app.all('*', function (req, res) {
    throw new Error("You Hit Wrong Api!!!, Plz Check")
});
app.use(function (err, req, res, next) {
    if (err.message === "You Hit Wrong Api!!!, Plz Check") {
        res.status(400).send({ status: false, error: err.message });
    }
});

// LISTEN FOR INCOMING REQUESTS-----
app.listen(process.env.PORT || 3000, function (){
    console.log('Express app running on port' + (process.env.PORT || 3000))
})