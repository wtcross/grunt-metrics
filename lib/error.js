/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var util = require("util");

module.exports = function (type, name, message) {
	return {
		type    : type,
		name    : name,
		message : util.format("[%s][%s] %s", type, name, message)
	};
};
