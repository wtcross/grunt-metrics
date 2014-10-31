/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _ = require("lodash");

function travis (config) {
	var result = {
		series : "travis",
		data   : {}
	};

	if (!process.env.TRAVIS) {
		return result;
	}

	var defaults = {};

	config = _.extend(defaults, config);

	var mapping = {
		"branch"       : "TRAVIS_BRANCH",
		"commit"       : "TRAVIS_COMMIT",
		"commit-range" : "TRAVIS_COMMIT_RANGE",
		"job-id"       : "TRAVIS_JOB_ID",
		"job-number"   : "TRAVIS_JOB_NUMBER",
		"pull-request" : "TRAVIS_PULL_REQUEST",
		"repo-slug"    : "TRAVIS_REPO_SLUG",
		"tag"          : "TRAVIS_TAG"
	};

	_.each(mapping, function (name, metric) {
		var value = process.env[name];

		if (value) {
			result.data[metric] = value;
		}
	});

	return result;
}

module.exports = travis;
