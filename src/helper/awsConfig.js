//*********************************************AWS CONFIG******************************************** */
const AWS = require('aws-sdk')
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    accessKeyId: process.env.ACCESSKEYID ,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: process.env.REGION
})

let uploadFile = async (file) => {
    try {
        // Wrap the S3 upload functionality in a promise
        const uploadToS3 = (uploadParams) => {
            return new Promise((resolve, reject) => {
                let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

                s3.upload(uploadParams, function (err, data) {
                    if (err) {
                        reject({ "error": err });
                    } else {
                        console.log(data);
                        console.log("File uploaded successfully");
                        resolve(data.Location);
                    }
                });
            });
        };

        let date = new Date()
        console.log(date)

        // AWS S3 upload parameters
        const uploadParams = {
            ACL: "public-read",
            Bucket: "prince",
            Key: "profile-img-" + date + file.originalname,
            Body: file.buffer
        };

        // Await the S3 upload function
        const location = await uploadToS3(uploadParams);

        return location;
    } catch (error) {
        return { message: "Error in AWS", error: error };
    }
};


module.exports = {
    uploadFile
}

