/*
 * grunt-metrics
 * https://github.com/wtcross/grunt-metrics
 *
 * Copyright (c) 2014 Tyler Cross
 * Licensed under the MIT license.
 */

"use strict";
var _      = require("lodash");
var chalk  = require("chalk");
var square = require("figures").square;
var table  = require("text-table");
var Q      = require("q");

function console (config, metrics) {
	var data = metrics.grunt;

	var defaults = {
		verbose   : false,
		columns   : 80,
		threshold : 0.001
	};

	config = _.extend(defaults, config);

	function formatTable () {
		var totalTime = data.duration;

		var longestTaskName = _.reduce(data.tasks, function (result, task) {
			var average = task.duration / totalTime;

			if (average < config.threshold && !config.verbose) {
				return result;
			}

			return Math.max(result, task.name.length);
		}, 0);

		var maxColumns = process.stdout.columns || config.columns;
		var maxBarWidth;

		if (longestTaskName > maxColumns / 2) {
			maxBarWidth = (maxColumns - 20) / 2;
		}
		else {
			maxBarWidth = maxColumns - (longestTaskName + 20);
		}

		function shorten (taskName) {
			var nameLength = taskName.length;

			if (nameLength <= maxBarWidth) {
				return taskName;
			}

			var partLength = Math.floor((maxBarWidth - 3) / 2);
			var start = taskName.substr(0, partLength + 1);
			var end = taskName.substr(nameLength - partLength);

			return start.trim() + "..." + end.trim();
		}

		function createBar (percentage) {
			var rounded = Math.round(percentage * 100);

			if (rounded === 0) {
				return "0%";
			}

			var barLength = Math.ceil(maxBarWidth * percentage) + 1;
			var bar = new Array(barLength).join(square);
			return bar + " " + rounded + "%";
		}

		function formatMs (ms) {
			return [ ms, "ms" ].join(" ");
		}

		var tableData = _.reduce(data.tasks, function (result, task) {
			var average = task.duration / totalTime;

			if (average < config.threshold && !config.verbose) {
				return result;
			}

			result.push([
				shorten(task.name),
				chalk.blue(formatMs(task.duration)),
				chalk.blue(createBar(average))
			]);

			return result;
		}, []);

		tableData.push([ chalk.magenta("Total", formatMs(totalTime)) ]);

		return table(tableData, {
			align        : [ "l", "r", "l" ],
			stringLength : function (str) {
				return chalk.stripColor(str).length;
			}
		});
	}

	console.log(formatTable(metrics));

	return new Q();
}

console.log = function (str) {
	process.stdout.write(str + "\n", "utf8");
};

module.exports = console;
