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
	var taskCount    = 0;

	var prevTaskName = "loading tasks";

	var series = {
		build : [],
		tasks : []
	};

	hooker.hook(grunt.log, "header", function () {
		var now      = moment();
		var duration = now.diff(endTime);

		var name = grunt.task.current.nameArgs;

		if (prevTaskName && prevTaskName !== name) {
			series.tasks.push({
				name              : prevTaskName,
				duration          : moment.duration(duration).as("milliseconds"),
				"sequence_number" : taskCount,
				time              : endTime.valueOf()
			});
		}

		endTime      = now;
		prevTaskName = name;
		taskCount    = taskCount + 1;
	});

	grunt.registerTask("metrics", "Report metrics gathered during task execution.", function () {
		hooker.unhook(grunt.log, "header");

		var done = this.async();

		var defaults = {
			collectors : {},
			reporters  : {}
		};

		var config = _.extend(defaults, grunt.config.get("metrics"));

		var now = moment();
		var end = now;
		var start = startTime;

		series.build.push({
			time     : start.valueOf(),
			start    : start.valueOf(),
			end      : end.valueOf(),
			tasks    : taskCount - 1,
			duration : moment.duration(end.diff(start)).as("milliseconds")
		});

		return Q.allSettled(
			_.map(collectors, function (collector) {
				var collectorConfig = config.collectors[collector.name];
				return collector(collectorConfig);
			})
		)
		.then(function (results) {
			_.forEach(results, function (result) {
				if (result.state === "fulfilled") {
					_.merge(series, result.value);
				}
				else {
					grunt.log.error(result.reason.message);
				}
			});

			return Q.allSettled(
				_.map(reporters, function (reporter) {
					var reporterConfig = config.reporters[reporter.name];
					return reporter(reporterConfig, series);
				})
			)
			.then(function (results) {
				_.forEach(results, function (result) {
					if (result.state !== "fulfilled") {
						grunt.log.error(result.reason.message);
					}
				});
			});
		})
		.nodeify(done);
	});
};
