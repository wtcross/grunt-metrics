"use strict";
var expect     = require("chai").expect;
var proxyquire = require("proxyquire").noCallThru();
var _          = require("lodash");
var sinon      = require("sinon");

describe("The grunt-metrics plugin influx reporter", function () {
	var influxReporter;
	var influx;
	var writeSeries;

	before(function () {
		writeSeries = sinon.stub();
		writeSeries.callsArg(1);
		var client = {
			writeSeries : writeSeries
		};
		influx = sinon.stub();
		influx.returns(client);

		proxyquire("../../../lib/reporters/influx", {
			influx : influx
		});

		influxReporter = require("../../../lib/reporters/influx");
	});

	after(function () {
		writeSeries.reset();
		influx.reset();
	});

	it("has a name", function () {
		expect(influxReporter.name).to.equal("influx");
	});

	describe("configuration validation", function () {
		function describeRequiredConfiguration (properties) {
			return function () {
				var errors;
				var config = {
					"username" : "test-username",
					"password" : "test-password",
					"database" : "test-db"
				};

				before(function (done) {
					var series = {};

					_.forEach(properties, function (property) {
						delete config[property];
					});

					influxReporter(config, series)
					.catch(function (err) {
						errors = err;
					})
					.nodeify(done);
				});

				it("returns a rejected promise containing an array of errors", function () {
					expect(errors, "array").to.be.an("array");
					expect(errors.length, "error count").to.equal(properties.length);
				});

				describe("rejections", function () {
					_.forEach(properties, function (property) {
						it("includes an error indicating '" + property + "' is required", function () {
							var message = "Missing required config: " + property;
							var error = _.first(errors, {
								type    : "reporter",
								name    : "influx",
								message : message
							});

							expect(error, "error").to.be.defined;
						});
					});
				});
			};
		}

		describe("for username", describeRequiredConfiguration([ "username" ]));
		describe("for password", describeRequiredConfiguration([ "password" ]));
		describe("for database", describeRequiredConfiguration([ "database" ]));
		describe("for multiple configs", describeRequiredConfiguration([ "database", "username" ]));
	});

	describe("with default configuration", function () {
		var result;
		var config = {
			username : "foo",
			password : "super-awesome-password",
			database : "some-db"
		};
		var series = {
			build : [
				{
					time     : 1415710229705,
					start    : 1415710229705,
					end      : 1415710237420,
					tasks    : 4,
					duration : 7715
				}
			],

			tasks : [
				{
					name              : "loading tasks",
					duration          : 12,
					"sequence_number" : 0,
					time              : 1415710229705
				},
				{
					name              : "jshint:src",
					duration          : 257,
					"sequence_number" : 1,
					time              : 1415710229717
				},
				{
					name              : "jshint:test",
					duration          : 1015,
					"sequence_number" : 2,
					time              : 1415710229974
				},
				{
					name              : "jscs:src",
					duration          : 681,
					"sequence_number" : 3,
					time              : 1415710230989
				},
				{
					name              : "mochaIstanbul:coverage",
					duration          : 5748,
					"sequence_number" : 4,
					time              : 1415710231670
				}
			],

			series : "npm",
			data   : {
				commit         : "8f0f6f520467c51c4010c3c66cf7fb6322405dcc",
				"author-name"  : "Tyler Cross",
				"author-email" : "tyler@crosscollab.com",
				name           : "grunt-metrics",
				version        : "0.2.1"
			}
		};

		before(function (done) {
			influxReporter(config, series)
			.then(function (res) {
				result = res;
			})
			.nodeify(done);
		});

		it("creates a client with the correct config", function () {
			var correctConfig = _.merge({}, config, {
				host : "localhost",
				port : 8086
			});

			expect(influx.calledOnce, "client created").to.be.true;
			expect(influx.calledWith(correctConfig), "config incorrect").to.be.true;
		});

		it("writes all series to influx", function () {
			expect(writeSeries.calledOnce, "called").to.be.true;
			expect(writeSeries.calledWith(series), "series").to.be.true;
		});
	});
});
