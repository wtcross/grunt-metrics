"use strict";
var Q    = require("q");
var path = require("path");
var fs   = require("fs");

module.exports = function (name) {
	var file = path.join(path.dirname(__dirname), "fixtures", name);
	return Q.nfcall(fs.readFile, file, "utf-8")
	.then(function (fixture) {
		try {
			var json = JSON.parse(fixture);
			return json;
		}
		catch (ex) {
			return fixture;
		}
	});
};