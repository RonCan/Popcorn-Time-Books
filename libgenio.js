var libgen = require("libgen");
var request = require("request");
var cheerio = require("cheerio");

var http = require('http');
var fs = require('fs');


var mirror= "http://gen.lib.rus.ec";
function findMirror( options, searchCallback, callback) {
	libgen.mirror(function (err, urlString) {
		if (err) {
			console.error(err);
			return callback({
				err: true,
				result: err
			});
		}else {
			console.log(urlString + " works");
			options.mirror = urlString;
			mirror = urlString;
			console.log(options);
			return searchCallback(options, callback);
		}
	});
}

var options = {
  mirror: 'http://gen.lib.rus.ec',
  query: 'cats',
  count: 5,
  sort_by: 'year',
  reverse: true
};
function searchBook(options, callback){
	console.log(options);
	libgen.search(options, function (err, data) {
		if(err) {
			console.error(err);
			callback ({
				err: true,
				result: err
			});
		} else{
			//console.log(data);
			callback({
				err: false,
				result: data,
                mirror: options.mirror
			});
		}
	});
}
exports.search = function(options, callback){
	if(!(options.query || typeof options.query === 'string')){
		return callback( {
			err: true,
			result: "Query cannot be empty, and related problem"
		})
	}
	if(mirror === ''){
		console.log("Mirror doesn't exists" );
		findMirror( options, searchBook, callback);
	} else {
		options.mirror = mirror;
		console.log("Mirror already exists: " + options.mirror);
		searchBook(options, callback)
	}
};

exports.getDownloadLink = function(requestUrl, callback){
	request(requestUrl, function (err, response, html) {
		if(!err && response.statusCode == 200){
			var $ = cheerio.load(html);
			$ = $("H2",  "body");
			href = $.parent().attr("href");
			return callback({
				err: false,
				result: href
			});
		}else {
			return callback({
				err: true,
				result: err
			});
		}
	});
};

exports.saveFile = function(filename, fileUrl, callback){
	var file = fs.createWriteStream(filename);
	http.get(mirror + fileUrl, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close(
				callback({
					err: false,
					result: "File saved"
				})
			)
		});
	}).on('error', function(err) {
		fs.unlink(dest);
		if (callback) callback(err.message);
	});
};