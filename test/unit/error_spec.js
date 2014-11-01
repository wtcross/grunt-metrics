"use strict";
var expect = require("chai").expect;

var error = require("../../lib/error");
var util  = require("util");

describe("The error factory", function () {
	it("is a function", function () {
		expect(error).to.be.a("function");
	});

	describe("creating an error object", function () {
		var result;

		var type = "collector";
		var name = "test";
		var message = "test error message";

		before(function () {
			result = error(type, name, message);
		});

		it("creates a valid error", function () {
			expect(result, "invalid").to.deep.equal({
				type    : type,
				name    : name,
				message : util.format("[%s][%s] %s", type, name, message)
			});
		});
	});
});
