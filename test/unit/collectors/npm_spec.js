"use strict";
var expect = require("chai").expect;
var fs     = require("fs");
var sinon  = require("sinon");

var npm = require("../../../lib/collectors/npm");

describe("The grunt-metrics plugin npm collector", function () {
	it("has a name", function () {
		expect(npm.name).to.equal("npm");
	});

	var readFileSync;

	before(function () {
		readFileSync = sinon.stub(fs, "readFileSync");
	});

	after(function () {
		readFileSync.restore();
	});

	describe("with a package version", function () {
		var result;

		var config = {};
		var pkg = {
			name    : "test-package",
			version : "0.1.0"
		};

		before(function () {
			readFileSync.returns(JSON.stringify(pkg));
			result = npm(config);
		});

		after(function () {
			readFileSync.reset();
		});

		it("returns the correct series name", function () {
			expect(result.series).to.equal("npm");
		});

		it("returns the correct package name", function () {
			expect(result.data.name).to.equal(pkg.name);
		});

		it("returns the correct package version", function () {
			expect(result.data.version).to.equal(pkg.version);
		});
	});

	describe("without a package version", function () {
		var result;

		var config = {};
		var pkg = {
			name : "test-package"
		};

		before(function () {
			readFileSync.returns(JSON.stringify(pkg));
			result = npm(config);
		});

		after(function () {
			readFileSync.reset();
		});

		it("returns the correct series name", function () {
			expect(result.series).to.equal("npm");
		});

		it("returns the correct package name", function () {
			expect(result.data.name).to.equal(pkg.name);
		});
	});
});
