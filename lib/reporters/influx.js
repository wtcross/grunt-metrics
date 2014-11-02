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

var CLIENT_CONFIG = [
	"host", "port", "username", "password", "database"
];

function influx (config, series) {
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

	var clientConfig = _.pick(config, CLIENT_CONFIG);
	var client = influxClient(clientConfig);

	var time = series.build[0].time;

	_.forEach(series, function (points, name) {
		_.forEach(points, function (point) {
			if (!point.time) {
				point.time = time;
			}
		});
	});

	return Q.ninvoke(client, "writeSeries", series);
}

module.exports = influx;
