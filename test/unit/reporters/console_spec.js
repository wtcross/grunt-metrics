"use strict";
var expect     = require("chai").expect;
var sinon      = require("sinon");
var Q          = require("q");
var stripColor = require("stripcolorcodes");

var consoleReporter = require("../../../lib/reporters/console");
var fixture         = require("../helpers/fixture");
var utilities       = require("../helpers/utilities");
var setValue        = utilities.setValue;

describe("The grunt-metrics plugin console reporter", function () {
	var log;
	var metricsFixture;
	var longNameMetricsFixture;
	var outputFixture;
	var longNameOutputFixture;
	var defaultColumnWidthOutputFixture;
	var customConfigOutputFixture;
	var columns;

	before(function (done) {
		columns = setValue(process.stdout, "columns", 80);
		log = sinon.stub(consoleReporter, "log");

		Q.all([
			fixture("metrics.json"),
			fixture("metrics-long-name.json"),
			fixture("console/output.txt"),
			fixture("console/long-name-output.txt"),
			fixture("console/default-column-width-output.txt"),
			fixture("console/custom-config-output.txt")
		])
		.spread(function (metrics, longNameMetrics, output, longNameOutput, defaultColumnWidthOutput, customConfigOutput) {
			metricsFixture = metrics;
			longNameMetricsFixture = longNameMetrics;
			outputFixture = output;
			longNameOutputFixture = longNameOutput;
			defaultColumnWidthOutputFixture = defaultColumnWidthOutput;
			customConfigOutputFixture = customConfigOutput;
		})
		.nodeify(done);
	});

	after(function () {
		log.restore();
		columns.restore();
	});

	it("has a name", function () {
		expect(consoleReporter.name).to.equal("console");
	});

	describe("with default configuration", function () {
		var config = {
			enable : true
		};

		before(function (done) {
			consoleReporter(config, metricsFixture).nodeify(done);
		});

		after(function () {
			log.reset();
		});

		it("writes the report", function () {
			expect(log.calledOnce, "not called").to.be.true;
			expect(stripColor(log.firstCall.args[0]), "incorrect output").to.equal(outputFixture);
		});
	});

	describe("with custom configuration", function () {
		var config = {
			verbose   : false,
			columns   : 100,
			threshold : 0.01,
			enable    : true
		};

		before(function (done) {
			consoleReporter(config, metricsFixture).nodeify(done);
		});

		after(function () {
			log.reset();
		});

		it("writes the report", function () {
			expect(log.calledOnce, "not called").to.be.true;
			expect(stripColor(log.firstCall.args[0]), "incorrect output").to.equal(customConfigOutputFixture);
		});
	});

	describe("handling long task names", function () {
		var config = {
			enable : true
		};

		before(function (done) {
			consoleReporter(config, longNameMetricsFixture).nodeify(done);
		});

		after(function () {
			log.reset();
		});

		it("writes the report", function () {
			expect(log.calledOnce, "not called").to.be.true;
			expect(stripColor(log.firstCall.args[0]), "incorrect output").to.equal(longNameOutputFixture);
		});
	});

	describe("when process.stdout.columns is not set", function () {
		var oldColumns;
		var config = {
			enable : true
		};

		before(function (done) {
			oldColumns = setValue(process.stdout, "columns", 0);
			process.stdout.columns = 0;
			consoleReporter(config, metricsFixture).nodeify(done);
		});

		after(function () {
			oldColumns.restore();
			log.reset();
		});

		it("uses the default column width", function () {
			expect(log.calledOnce, "not called").to.be.true;
			expect(stripColor(log.firstCall.args[0]), "incorrect output").to.equal(defaultColumnWidthOutputFixture);
		});
	});
});

describe("The console reporter log method", function () {
	var write;
	var text = "test";

	before(function () {
		write = sinon.stub(process.stdout, "write");
		consoleReporter.log(text);
	});

	after(function () {
		write.restore();
	});

	it("properly invokes process.stdin.write", function () {
		expect(write.calledOnce, "not called").to.be.true;
		expect(write.calledWith(text + "\n", "utf8"), "invalid args").to.be.true;
	});
});