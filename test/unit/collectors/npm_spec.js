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

		it("returns the correct series", function () {
			expect(result).to.have.property("npm");
		});

		it("returns just one point", function () {
			expect(result.npm.length).to.equal(1);
		});

		it("returns the correct package name", function () {
			expect(result.npm[0].name).to.equal(pkg.name);
		});

		it("returns the correct package version", function () {
			expect(result.npm[0].version).to.equal(pkg.version);
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

		it("returns the correct series", function () {
			expect(result).to.have.property("npm");
		});

		it("returns just one point", function () {
			expect(result.npm.length).to.equal(1);
		});

		it("returns the correct package name", function () {
			expect(result.npm[0].name).to.equal(pkg.name);
		});
	});
});
