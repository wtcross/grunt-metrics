"use strict";
var expect = require("chai").expect;
var sinon  = require("sinon");
var fs     = require("fs");
var path   = require("path");

var fixture = require("./fixture");

describe("The fixture helper", function () {
	it("is a function", function () {
		expect(fixture).to.be.a("function");
	});

	describe("loading a JSON fixture", function () {
		var readFile;
		var name = "test.json";
		var result;

		before(function (done) {
			readFile = sinon.spy(fs, "readFile");
			fixture(name)
			.then(function (json) {
				result = json;
			})
			.nodeify(done);
		});

		after(function () {
			readFile.restore();
		});

		it("reads the correct path", function () {
			var file = path.join(path.dirname(__dirname), "fixtures", name);
			expect(readFile.calledOnce, "not called").to.be.true;
			expect(readFile.calledWith(file, "utf-8", sinon.match.func), "incorrect args").to.be.true;
		});

		it("returns json file as an object", function () {
			expect(result).to.be.an("object");
		});
	});

	describe("loading a text fixture", function () {
		var readFile;
		var name = "test.txt";
		var result;

		before(function (done) {
			readFile = sinon.spy(fs, "readFile");
			fixture(name)
			.then(function (json) {
				result = json;
			})
			.nodeify(done);
		});

		after(function () {
			readFile.restore();
		});

		it("reads the correct path", function () {
			var file = path.join(path.dirname(__dirname), "fixtures", name);
			expect(readFile.calledOnce, "not called").to.be.true;
			expect(readFile.calledWith(file, "utf-8", sinon.match.func), "incorrect args").to.be.true;
		});

		it("returns json file as an object", function () {
			expect(result).to.be.a("string");
		});
	});
});
