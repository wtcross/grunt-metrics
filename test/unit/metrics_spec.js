"use strict";
var expect     = require("chai").expect;
var sinon      = require("sinon");
var hooker     = require("hooker");
var proxyquire = require("proxyquire").noCallThru();
var Q          = require("q");

describe("The grunt-metrics plugin", function () {
	var plugin;
	var grunt;
	var task;

	var hook;
	var registerTask;
	var header;

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
		header = sinon.stub();

		grunt = {
			registerTask : registerTask,

			log : {
				header : header
			},

			task : {
				current : {
					nameArgs : "test"
				}
			}
		};

		hook = sinon.stub(hooker, "hook");

		collector.func.returns({
			series : "test",
			data   : {}
		});

		reporter.func.returns(new Q());

		metrics = proxyquire("../../tasks/metrics", {
			"./collectors" : [ collector.func ],
			"./reporters"  : [ reporter.func ]
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
			var unhook;
			var get;
			var done;

			var config = {
				reporters  : {},
				collectors : {}
			};

			var tasks = [
				{
					name     : "loading tasks",
					duration : 3
				},
				{
					name     : "task a",
					duration : 200
				},
				{
					name     : "task b",
					duration : 300
				},
				{
					name     : "task c",
					duration : 1200
				}
			];

			config.collectors[collector.func.name] = collector.config;
			config.reporters[reporter.func.name] = reporter.config;

			before(function () {
				done = sinon.spy();
				async = sinon.stub();
				async.returns(done);

				unhook = sinon.stub(hooker, "unhook");

				get = sinon.stub();
				get.returns(config);

				grunt.config = {
					get : get
				};

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
				collector.func.reset();
				reporter.func.reset();
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

				it("has grunt task metrics", function () {
					expect(gatheredMetrics, "no grunt metrics").to.have.property("grunt");
				});

				describe("grunt task metrics", function () {
					it("has the correct number of tasks recorded", function () {
						expect(gatheredMetrics.grunt.tasks.length, "wrong number of tasks").to.equal(4);
					});

					it("has the correct data for each task", function () {
						expect(gatheredMetrics.grunt.tasks, "didn't record tasks correctly").to.deep.equal(tasks);
					});
				});
			});
		});
	});
});