/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _    = require("lodash");
var fs   = require("fs");
var path = require("path");
var Q    = require("q");

function json (config, metrics) {
	var defaults = {
		path  : path.join(process.cwd(), "metrics.json"),
		space : 2
	};

	config = _.extend(defaults, config);

	var data = JSON.stringify(metrics, null, config.space);
	return Q.nfcall(fs.writeFile, config.path, data);
}

module.exports = json;
