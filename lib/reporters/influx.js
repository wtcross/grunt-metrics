/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _            = require("lodash");
var Q            = require("q");
var influxClient = require("influx");

var error = require("../error");

var REQUIRED_CONFIG = [
	"username", "password", "database"
];

var INFLUX_CONFIG = [
	"host", "port", "username", "password", "database"
];

function influx (config, metrics) {
	var defaults = {
		host : "localhost",
		port : 8086
	};

	config = _.extend(defaults, config);

	_.forEach(REQUIRED_CONFIG, function (property) {
		if (!_.has(config, property)) {
			var message = "Missing required config: " + property;
			throw error("reporter", "influx", message);
		}
	});

	var client = influxClient(_.pick(config, INFLUX_CONFIG));

	// Write grunt metrics first.
	var tasks = metrics.grunt.tasks;
	delete metrics.grunt.tasks;

	console.log(tasks);

	// Write collected metrics.

	return new Q();
}

module.exports = influx;
