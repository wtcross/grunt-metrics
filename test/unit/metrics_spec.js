"use strict";
var expect     = require("chai").expect;
var sinon      = require("sinon");
var hooker     = require("hooker");
var proxyquire = require("proxyquire").noCallThru();
var Q          = require("q");

var createError = require("../../lib/error");

describe("The grunt-metrics plugin", function () {
	var plugin;
	var grunt;
	var task;

	var hook;
	var unhook;
	var registerTask;
	var header;
	var error;

	var metrics;

	var collector = {
		func   : sinon.stub(),
		config : {
			test : "test"
		}
	};

	var reporter = {
		func   : sinon.stub(),
		config : {
			test : "test"
		}
	};

	before(function () {
		registerTask = sinon.stub();
		header       = sinon.stub();
		error        = sinon.stub();

		grunt = {
			registerTask : registerTask,

			log : {
				header : header,
				error  : error
			},

			task : {
				current : {
					nameArgs : "test"
				}
			}
		};

		hook = sinon.stub(hooker, "hook");
		unhook = sinon.stub(hooker, "unhook");

		metrics = proxyquire("../../tasks/metrics", {
			"../lib/collectors" : [ collector.func ],
			"../lib/reporters"  : [ reporter.func ]
		});

		plugin = metrics(grunt);

		task = registerTask.firstCall.args[2];
	});

	after(function () {
		hook.restore();
		delete grunt.registerTask;
		delete grunt.log;
	});

	it("wraps the grunt.log.header method", function () {
		expect(hook.calledOnce, "not wrapped").to.be.true;
		expect(hook.calledWith(grunt.log, "header", sinon.match.func), "incorrect args").to.be.true;
	});

	it("registers the metrics task", function () {
		expect(registerTask.calledOnce, "not registered").to.be.true;
		expect(registerTask.calledWith(
			"metrics",
			"Report metrics gathered during task execution.",
			sinon.match.func
		), "incorrect args").to.be.true;
	});

	describe("the metrics task", function () {
		describe("timing multiple tasks being ran", function () {
			var clock;
			var async;
			var get;
			var done;

			var config = {
				reporters  : {},
				collectors : {}
			};

			var tasks = [
				{
					name              : "loading tasks",
					duration          : 3,
					"sequence_number" : 1,
					time              : 0
				},
				{
					name              : "task a",
					duration          : 200,
					"sequence_number" : 2,
					time              : 3
				},
				{
					name              : "task b",
					duration          : 300,
					"sequence_number" : 3,
					time              : 203
				},
				{
					name              : "task c",
					duration          : 1200,
					"sequence_number" : 4,
					time              : 503
				}
			];

			config.collectors[collector.func.name] = collector.config;
			config.reporters[reporter.func.name] = reporter.config;

			before(function () {
				done = sinon.spy();
				async = sinon.stub();
				async.returns(done);

				get = sinon.stub();
				get.returns(config);

				grunt.config = {
					get : get
				};

				collector.func.returns({
					test : {}
				});

				reporter.func.returns(new Q({
					series : "test",
					data   : {}
				}));

				function runTask (task) {
					var wrapper = hook.firstCall.args[2];
					grunt.task.current.nameArgs = task.name;
					wrapper();
					clock.tick(task.duration);
				}

				clock = sinon.useFakeTimers();

				tasks.forEach(runTask);

				// This would be recorded when the grunt-metrics task is ran below.
				runTask({
					name     : "metrics",
					duration : 50
				});

				task.apply({
					async : async
				});
			});

			after(function () {
				unhook.reset();
				collector.func.reset();
				reporter.func.reset();
				grunt.log.header.reset();
				grunt.log.error.reset();
				clock.restore();
			});

			it("unwraps the grunt.log.header method", function () {
				expect(unhook.calledOnce, "not called").to.be.true;
				expect(unhook.calledWith(grunt.log, "header"), "incorrect args").to.be.true;
			});

			it("is asynchronous", function () {
				expect(async.calledOnce, "async not invoked").to.be.true;
				expect(done.calledOnce, "callback not invoked").to.be.true;
			});

			it("gets configuration", function () {
				expect(get.calledOnce, "not called").to.be.true;
				expect(get.calledWith("metrics"), "wrong config name").to.be.true;
			});

			it("invokes the collector", function () {
				expect(collector.func.calledOnce, "not called").to.be.true;
				expect(collector.func.calledWith(collector.config), "wrong config").to.be.true;
			});

			it("invokes the reporter", function () {
				expect(reporter.func.calledOnce, "not called").to.be.true;
				expect(reporter.func.calledWith(reporter.config), "wrong config").to.be.true;
			});

			describe("gathered metrics", function () {
				var gatheredMetrics;

				before(function () {
					gatheredMetrics = reporter.func.firstCall.args[1];
				});

				it("has build metrics", function () {
					expect(gatheredMetrics, "no grunt metrics").to.have.property("build");
				});

				it("has task metrics", function () {
					expect(gatheredMetrics, "no grunt metrics").to.have.property("tasks");
				});

				describe("grunt task metrics", function () {
					it("has the correct number of tasks recorded", function () {
						expect(gatheredMetrics.tasks.length, "wrong number of tasks").to.equal(4);
					});

					it("has the correct data for each task", function () {
						expect(gatheredMetrics.tasks, "didn't record tasks correctly").to.deep.equal(tasks);
					});
				});
			});
		});

		describe("with collector and reporter errors", function () {
			var clock;
			var async;
			var get;
			var done;

			var config = {
				reporters  : {},
				collectors : {}
			};

			var tasks = [
				{
					name              : "loading tasks",
					duration          : 3,
					"sequence_number" : 1,
					time              : 0
				},
				{
					name              : "task a",
					duration          : 200,
					"sequence_number" : 2,
					time              : 3
				},
				{
					name              : "task b",
					duration          : 300,
					"sequence_number" : 3,
					time              : 203
				},
				{
					name              : "task c",
					duration          : 1200,
					"sequence_number" : 4,
					time              : 503
				}
			];

			var reporterError = createError("reporter", "test", "test message");
			var collectorError = createError("collector", "test", "test message");

			config.collectors[collector.func.name] = collector.config;
			config.reporters[reporter.func.name] = reporter.config;

			before(function () {
				done = sinon.spy();
				async = sinon.stub();
				async.returns(done);

				get = sinon.stub();
				get.returns(config);

				grunt.config = {
					get : get
				};

				collector.func.returns(new Q.reject(collectorError));

				reporter.func.returns(new Q.reject(reporterError));

				function runTask (task) {
					var wrapper = hook.firstCall.args[2];
					grunt.task.current.nameArgs = task.name;
					wrapper();
					clock.tick(task.duration);
				}

				clock = sinon.useFakeTimers();

				tasks.forEach(runTask);

				// This would be recorded when the grunt-metrics task is ran below.
				runTask({
					name     : "metrics",
					duration : 50
				});

				task.apply({
					async : async
				});
			});

			after(function () {
				unhook.reset();
				collector.func.reset();
				reporter.func.reset();
				grunt.log.header.reset();
				grunt.log.error.reset();
				clock.restore();
			});

			it("logs the error message from the collector", function () {
				expect(grunt.log.error.calledWith(collectorError.message)).to.be.true;
			});

			it("logs the error message from the reporter", function () {
				expect(grunt.log.error.calledWith(reporterError.message)).to.be.true;
			});
		});
	});
});
