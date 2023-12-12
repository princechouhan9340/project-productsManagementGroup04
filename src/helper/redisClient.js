const redis = require("redis"); 
const dotenv = require('dotenv');
dotenv.config();
let client ;
if(process.env.ENV == 'prod'){
	 client = redis.createClient({
		password: process.env.REDISPASS,
		socket: {
			host: process.env.REDISHOST,
			port: process.env.REDISPORT
		}
	});
}else{
	 client = redis.createClient(); 
}



(async () => { 
	await client.connect(); 
})(); 

console.log("Connecting to the Redis"); 

client.on("ready", () => { 
	console.log("redis Connected!"); 
}); 

client.on("error", (err) => { 
	// console.log("Error in the Connection"); 
}); 


module.exports = client