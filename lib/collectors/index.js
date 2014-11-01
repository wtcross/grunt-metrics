/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var travis = require("./travis");
var git    = require("./git");
var npm    = require("./npm");

module.exports = [
	travis,
	git,
	npm
];
