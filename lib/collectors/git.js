/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _     = require("lodash");
var shell = require("shelljs");
var path  = require("path");
var fs    = require("fs");

function git (config) {
	var series = {
		git : []
	};

	var gitDir = path.join(process.cwd(), ".git");
	if (!(shell.which("git") && fs.existsSync(gitDir))) {
		return series;
	}

	var defaults = {};

	config = _.extend(defaults, config);

	var options = {
		silent : true
	};

	series.git.push({
		commit         : shell.exec("git rev-parse --verify HEAD", options).output.trim(),
		"author-name"  : shell.exec("git --no-pager show -s --format='%an' HEAD", options).output.trim(),
		"author-email" : shell.exec("git --no-pager show -s --format='%ae' HEAD", options).output.trim()
	});

	return series;
}

module.exports = git;