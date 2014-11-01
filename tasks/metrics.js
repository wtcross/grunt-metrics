/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var collectors = require("../lib/collectors");
var reporters  = require("../lib/reporters");

var hooker = require("hooker");
var moment = require("moment");
var Q      = require("q");
var _      = require("lodash");

module.exports = function (grunt) {
	var startTime    = moment();
	var endTime      = startTime;

	var prevTaskName = "loading tasks";

	var result = {
		series : "grunt",
		data   : {
			start    : startTime,
			end      : null,
			duration : null,
			tasks    : []
		}
	};

	hooker.hook(grunt.log, "header", function () {
		var now      = moment();
		var duration = now.diff(endTime);

		var name = grunt.task.current.nameArgs;

		if (prevTaskName && prevTaskName !== name) {
			result.data.tasks.push({
				name     : prevTaskName,
				duration : moment.duration(duration).as("milliseconds")
			});
		}

		endTime = now;
		prevTaskName = name;
	});

	grunt.registerTask("metrics", "Report metrics gathered during task execution.", function () {
		hooker.unhook(grunt.log, "header");

		var done = this.async();

		var defaults = {
			collectors : {},
			reporters  : {}
		};

		var config = _.extend(defaults, grunt.config.get("metrics"));

		var now              = moment();
		result.data.end      = now;
		result.data.duration = moment.duration(result.data.end.diff(result.data.start)).as("milliseconds");

		return Q.all(
			_.map(collectors, function (collector) {
				var collectorConfig = config.collectors[collector.name];
				return collector(collectorConfig);
			})
		)
		.then(function (results) {
			results.push(result);

			var metrics = _.reduce(results, function (acc, result) {
				acc[result.series] = result.data;
				return acc;
			}, {});

			return Q.all(
				_.map(reporters, function (reporter) {
					var reporterConfig = config.reporters[reporter.name];
					try {
						reporter(reporterConfig, metrics);
					}
					catch (ex) {

					}
				})
			);
		})
		.nodeify(done);
	});
};
