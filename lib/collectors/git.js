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
	var result = {
		series : "git",
		data   : {}
	};

	var gitDir = path.join(process.cwd(), ".git");
	if (!(shell.which("git") && fs.existsSync(gitDir))) {
		return result;
	}

	var defaults = {};

	config = _.extend(defaults, config);

	var options = {
		silent : true
	};

	result.data.commit = shell.exec("git rev-parse --verify HEAD", options).output.trim();
	result.data["author-name"] = shell.exec("git --no-pager show -s --format='%an' HEAD", options).output.trim();
	result.data["author-email"] = shell.exec("git --no-pager show -s --format='%ae' HEAD", options).output.trim();

	return result;
}

module.exports = git;