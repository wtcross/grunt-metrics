"use strict";
var expect  = require("chai").expect;
var fs      = require("fs");
var sinon   = require("sinon");
var path    = require("path");

var json    = require("../../../tasks/reporters/json");
var fixture = require("../helpers/fixture");

describe("The grunt-metrics plugin json reporter", function () {
	var metricsFixture;

	before(function (done) {
		fixture("metrics.json")
		.then(function (metrics) {
			metricsFixture = metrics;
		})
		.nodeify(done);
	});

	it("has a name", function () {
		expect(json.name).to.equal("json");
	});

	describe("with default configuration", function () {
		var writeFile;
		var stringify;
		var space = 2;

		before(function (done) {
			stringify = sinon.spy(JSON, "stringify");
			writeFile = sinon.stub(fs, "writeFile");
			writeFile.callsArg(2);

			json({}, metricsFixture).nodeify(done);
		});

		after(function () {
			writeFile.restore();
			stringify.restore();
		});

		it("uses the correct space setting", function () {
			expect(stringify.calledOnce, "not called").to.be.true;
			expect(stringify.calledWith(metricsFixture, null, space), "wrong arguments").to.be.true;
		});

		it("creates the correct file", function () {
			var file = path.join(process.cwd(), "metrics.json");
			var data = JSON.stringify(metricsFixture, null, space);

			expect(writeFile.calledOnce, "not called").to.be.true;
			expect(writeFile.calledWith(file, data));
		});
	});

	describe("with custom configuration", function () {
		var writeFile;
		var stringify;
		var config = {
			path  : "/tmp/metrics.json",
			space : 4
		};

		before(function (done) {
			stringify = sinon.spy(JSON, "stringify");
			writeFile = sinon.stub(fs, "writeFile");
			writeFile.callsArg(2);

			json(config, metricsFixture).nodeify(done);
		});

		after(function () {
			writeFile.restore();
			stringify.restore();
		});

		it("uses the correct space setting", function () {
			expect(stringify.calledOnce, "not called").to.be.true;
			expect(stringify.calledWith(metricsFixture, null, config.space), "wrong arguments").to.be.true;
		});

		it("creates the correct file", function () {
			var data = JSON.stringify(metricsFixture, null, config.space);

			expect(writeFile.calledOnce, "not called").to.be.true;
			expect(writeFile.calledWith(config.path, data));
		});
	});
});
