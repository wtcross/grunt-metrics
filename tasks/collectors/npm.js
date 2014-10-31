/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _     = require("lodash");
var path  = require("path");
var fs    = require("fs");

function npm (config) {
	var result = {
		series : "npm",
		data   : {}
	};

	var defaults = {
		path : path.join(process.cwd(), "package.json")
	};

	config = _.extend(defaults, config);

	var pkg = JSON.parse(fs.readFileSync(config.path, "utf8"));

	result.data.name = pkg.name;

	if (pkg.version) {
		result.data.version = pkg.version;
	}

	return result;
}

module.exports = npm;