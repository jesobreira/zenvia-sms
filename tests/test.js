const username = "your-username-here";
const password = "your-password-here";

const zenvia = require('node-zenvia-sms')(username, password, "debug"); // remove "debug" in production

zenvia.sendSms("test", "remetente", "5511987654321", "", "", "", "NONE", function success() {
	console.log("SMS was sent");
}, function fail() {
	console.log("Error: "+error.status)
})