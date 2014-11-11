/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var console = require("./console");
var json    = require("./json");
var influx  = require("./influx");

module.exports = [
	console,
	json,
	influx
];
