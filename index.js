'use strict';

const request = require('request');

module.exports = function(username, password, debug) {

	if(typeof debug == 'undefined') debug = false;

	const baseUrl = "https://api-rest.zenvia360.com.br/services";

	var zenvia = {};

	function makeBaseAuth(e, t) {
		var n = e + ":" + t;
		var r = new Buffer(n).toString('base64');
		return "Basic " + r
	}

	zenvia.sendSms = function(msg, from, mobile, messageId, aggregateId, schedule, callbackOption, doneFunction, failFunction){

		var sendSmsUrl = baseUrl + "/send-sms";
		var stringg = JSON.stringify(serializeSendSmsRequest(msg, from, mobile, messageId, aggregateId, schedule, callbackOption));
		callPost(stringg, sendSmsUrl, doneFunction, failFunction);

	}

	zenvia.sendMultipleSms = function(layout, list, aggregateId, doneFunction, failFunction){

		var sendMultipleSmsUrl = baseUrl + "/send-sms-multiple";
		callPost(JSON.stringify(serializeSendSmsMultiRequest(layout, list, aggregateId)), sendMultipleSmsUrl, doneFunction, failFunction);

	}

	zenvia.cancelSms = function(messageId, doneFunction, failFunction){

		var cancelSmsUrl = baseUrl + "/cancel-sms/" +  messageId;
		callPost(undefined, cancelSmsUrl, doneFunction, failFunction);

	}

	zenvia.getSmsStatus = function(messageId, doneFunction, failFunction){

		var getSmsStatusUrl = baseUrl + "/get-sms-status/" + messageId;
		callGet(getSmsStatusUrl, doneFunction, failFunction);

	}

	zenvia.listUnreadMessages = function(doneFunction, failFunction){

		var listUnreadMessagesUrl = baseUrl + "/received/list";
		callPost(undefined, listUnreadMessagesUrl, doneFunction, failFunction);

	}

	zenvia.searchReceivedMessages = function(startPeriod, endPeriod, messageId, mobile, doneFunction, failFunction){
		var newUrl = "/received/search/";

		if(startPeriod != "" && endPeriod != ""){
			newUrl = newUrl + startPeriod + "/" + endPeriod;

			if(mobile != ""){
				newUrl = newUrl + "?mobile=" + mobile;
				if(messageId != ""){
					newUrl = newUrl + "&mtId=" + messageId;
				}
			} 
			else if(messageId != ""){
				newUrl = newUrl + "?mtId=" + messageId;
			}
		}

		var searchReceivedMessagesUrl = baseUrl + newUrl;
		callGet(searchReceivedMessagesUrl, doneFunction, failFunction);

	}

	// =============== internal use only ==============

	function callPost(data, url, doneFunction, failFunction) {

		if(debug) {
			console.log(data);
			console.log(url);
			console.log(doneFunction);
			console.log(failFunction);
		}

		if(typeof doneFunction == "undefined"){
			doneFunction = function(data){  defaultDoneFunction(data); }
		}

		if(typeof failFunction == "undefined"){
			failFunction = function(data){ defaultFailFunction(data) };
		}

		var options = {
			headers: {
				"Accept": "application/json",
				"Content-type": "application/json",
				"Authorization": makeBaseAuth(username, password)
			},
			method: 'POST',
			body: data,
			url: url
		}

		request(options, function(error, response, body) {
			if(error) {
				failFunction(response);
			} else {
				doneFunction(body);
			}
		})
	}

	function callGet(url, doneFunction, failFunction) {

		if(typeof doneFunction == "undefined"){
			doneFunction = function(data){  defaultDoneFunction(data); }
		}

		if(typeof failFunction == "undefined"){
			failFunction = function(data){ defaultFailFunction(data) };
		}

		var options = {
			headers: {
				"Accept": "application/json",
				"Authorization": makeBaseAuth(username, password)
			},
			url: url
		}

		request(options, function(error, response, body) {
			if(error) {
				failFunction(response);
			} else {
				doneFunction(body);
			}
		})
	}

	function validCallbackFunction(callbackFunction, defaultCallbackFunction){
		if(typeof callbackFunction == 'undefined'){
			return defaultCallbackFunction;
		}
		else{
			return callbackFunction;
		}

	}

	function defaultDoneFunction(data){
		if(debug) console.log(JSON.stringify(data, null, 4));
	}

	function defaultFailFunction (data){
		if(data.status == '401'){
			if(debug) console.error("HTTP 401 Unauthorized");
		} else if(data.responseJSON != null) {
			if(debug) console.error(JSON.stringify(data.responseJSON, null, 4));
		} else {
			if(debug) console.error(JSON.stringify(data, null, 4));
		}
	}

	function serializeSendSmsMultiRequest(layout, list, aggregateId){

		var lines = list.split("\n");

		var string = "{\"sendSmsMultiRequest\":  { \"aggregateId\" : \"" + aggregateId + "\", \"sendSmsRequestList\" : [ ";

		for(var i = 0; i < lines.length; i++) {
			var fields = lines[i].split(";");

			if(fields == ""){
				continue;
			}

			string = string + "{";

			if(layout == "A"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\"";

			} else if(layout == "B"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"from\": \"" + fields[2] + "\"";

			} else if(layout == "C"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\"";

			} else if(layout == "D"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\",";
				string = string + "\"from\": \"" + fields[3] + "\"";

			} else if(layout == "E"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\",";
				string = string + "\"from\": \"" + fields[3] + "\",";
				string = string + "\"schedule\": \"" + fields[4] + "\"";
			}

			string = string + "},";

		};

		string = string.substring(0, string.length - 1); 

		string = string + " ] } } "; 

		return JSON.parse(string);
	}

	function serializeSendSmsRequest(msg, from, mobile, messageId, aggregateId, schedule, callbackOption){

		var string = "{\"sendSmsRequest\":  { \"aggregateId\" : \"" + aggregateId + "\", ";
		string = string + "\"msg\" : \"" + msg + "\", ";
		string = string + "\"id\" : \"" + messageId + "\", ";
		string = string + "\"from\" : \"" + from + "\", ";
		string = string + "\"to\" : \"" + mobile + "\", ";
		string = string + "\"schedule\" : \"" + schedule + "\", ";
		string = string + "\"callbackOption\" : \"" + callbackOption + "\" ";

		string = string + " } } "; 

		return JSON.parse(string);

	}

	return zenvia;
}