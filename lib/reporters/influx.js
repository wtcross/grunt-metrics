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

var REQUIRED_CLIENT_CONFIG = [ "username", "password", "database" ];
var OPTIONAL_CLIENT_CONFIG = [ "host", "port" ];

var CLIENT_CONFIG = _.union(OPTIONAL_CLIENT_CONFIG, REQUIRED_CLIENT_CONFIG);

function influx (config, series) {
	var defaults = {
		host : "localhost",
		port : 8086
	};

	config = _.extend(defaults, config);

	var errors = _.reduce(REQUIRED_CLIENT_CONFIG, function (acc, property) {
		if (!_.has(config, property)) {
			var message = "Missing required config: " + property;
			acc.push(error("reporter", "influx", message));
		}

		return acc;
	}, []);

	if (errors.length > 0) {
		return Q.reject(errors);
	}

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
