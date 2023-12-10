const redis = require("redis"); 
const client = redis.createClient(); 

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