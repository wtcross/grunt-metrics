"use strict";
var expect = require("chai").expect;
var sinon  = require("sinon");
var shell = require("shelljs");
var fs = require("fs");

var git = require("../../../lib/collectors/git");

describe("The grunt-metrics plugin git collector", function () {
	it("has a name", function () {
		expect(git.name).to.equal("git");
	});

	describe("with git installed", function () {
		var which;

		before(function () {
			which = sinon.stub(shell, "which");
			which.withArgs("git").returns(true);
		});

		after(function () {
			which.restore();
		});

		describe("when current directory is a git repo", function () {
			var result;

			var existsSync;
			var exec;

			var config = {};
			var options = {
				silent : true
			};
			var authorName = "Tester";
			var authorEmail = "tester@testing.com";
			var commit = "COMMIT";

			before(function () {
				existsSync = sinon.stub(fs, "existsSync");
				existsSync.returns(true);

				exec = sinon.stub(shell, "exec");
				exec.withArgs("git rev-parse --verify HEAD", options).returns({
					output : commit
				});

				exec.withArgs("git --no-pager show -s --format='%an' HEAD", options).returns({
					output : authorName
				});

				exec.withArgs("git --no-pager show -s --format='%ae' HEAD", options).returns({
					output : authorEmail
				});

				result = git(config);
			});

			after(function () {
				existsSync.restore();
				exec.restore();
			});

			it("returns the correct series name", function () {
				expect(result.series).to.equal("git");
			});

			it("returns metrics", function () {
				expect(result.data).to.deep.equal({
					"author-name"  : authorName,
					"author-email" : authorEmail,
					commit         : commit
				});
			});
		});

		describe("when current directory is not a git repo", function () {
			var result;

			var existsSync;

			var config = {};

			before(function () {
				existsSync = sinon.stub(fs, "existsSync");
				existsSync.returns(false);

				result = git(config);
			});

			after(function () {
				existsSync.restore();
			});

			it("returns the correct series name", function () {
				expect(result.series).to.equal("git");
			});

			it("returns no metrics", function () {
				expect(result.data).to.be.empty;
			});
		});
	});

	describe("without git installed", function () {
		var which;
		var result;

		var existsSync;

		var config = {};

		before(function () {
			which = sinon.stub(shell, "which");
			which.withArgs("git").returns(false);
			existsSync = sinon.stub(fs, "existsSync");
			existsSync.returns(true);
			result = git(config);
		});

		after(function () {
			which.restore();
			existsSync.restore();
		});

		it("returns the correct series name", function () {
			expect(result.series).to.equal("git");
		});

		it("returns no metrics", function () {
			expect(result.data).to.be.empty;
		});
	});
});