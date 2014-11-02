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
	var series = {
		travis : []
	};

	if (!process.env.TRAVIS) {
		return series;
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

	var point = _.reduce(mapping, function (result, name, metric) {
		var value = process.env[name];

		if (value) {
			result[metric] = value;
		}

		return result;
	}, {});

	series.travis.push(point);

	return series;
}

module.exports = travis;
