"use strict";
var expect      = require("chai").expect;
var Environment = require("apparition").Environment;

var travis = require("../../../lib/collectors/travis");

describe("The grunt-metrics plugin travis collector", function () {
	it("has a name", function () {
		expect(travis.name).to.equal("travis");
	});

	var environment;

	before(function () {
		environment = new Environment();
	});

	after(function () {
		environment.restore();
	});

	describe("in travis environment", function () {
		before(function () {
			environment.set("TRAVIS", "true");
		});

		after(function () {
			environment.restore();
		});

		describe("with all mapped variables set", function () {
			var branch = "an-awesome-branch-1";
			var commit = "an-awesome-commit-1";
			var range  = "an-awesome-commit-range-1";
			var jobId  = "an-awesome-job-id-1";
			var jobNum = "an-awesome-job-num-1";
			var pr     = "an-awesome-pull-req-1";
			var repo   = "an-awesome-repo-1";
			var tag    = "an-awesome-tag-1";

			var result;
			var config = {};

			before(function () {
				environment.set("TRAVIS_BRANCH", branch);
				environment.set("TRAVIS_COMMIT", commit);
				environment.set("TRAVIS_COMMIT_RANGE", range);
				environment.set("TRAVIS_JOB_ID", jobId);
				environment.set("TRAVIS_JOB_NUMBER", jobNum);
				environment.set("TRAVIS_PULL_REQUEST", pr);
				environment.set("TRAVIS_REPO_SLUG", repo);
				environment.set("TRAVIS_TAG", tag);

				result = travis(config);
			});

			after(function () {
				environment.delete("TRAVIS_BRANCH");
				environment.delete("TRAVIS_COMMIT");
				environment.delete("TRAVIS_COMMIT_RANGE");
				environment.delete("TRAVIS_JOB_ID");
				environment.delete("TRAVIS_JOB_NUMBER");
				environment.delete("TRAVIS_PULL_REQUEST");
				environment.delete("TRAVIS_REPO_SLUG");
				environment.delete("TRAVIS_TAG");
			});

			it("returns the correct series", function () {
				expect(result).to.have.property("travis");
			});

			it("returns correct point", function () {
				expect(result.travis).to.deep.equal([ {
					"branch"       : branch,
					"commit"       : commit,
					"commit-range" : range,
					"job-id"       : jobId,
					"job-number"   : jobNum,
					"pull-request" : pr,
					"repo-slug"    : repo,
					"tag"          : tag
				} ]);
			});
		});

		describe("without all mapped variables set", function () {
			var branch = "an-awesome-branch-2";
			var commit = "an-awesome-commit-2";
			var range  = "an-awesome-commit-range-2";
			var jobId  = "an-awesome-job-id-2";
			var jobNum = "an-awesome-job-num-2";

			var result;
			var config = {};

			before(function () {
				environment.set("TRAVIS_BRANCH", branch);
				environment.set("TRAVIS_COMMIT", commit);
				environment.set("TRAVIS_COMMIT_RANGE", range);
				environment.set("TRAVIS_JOB_ID", jobId);
				environment.set("TRAVIS_JOB_NUMBER", jobNum);

				result = travis(config);
			});

			after(function () {
				environment.delete("TRAVIS_BRANCH");
				environment.delete("TRAVIS_COMMIT");
				environment.delete("TRAVIS_COMMIT_RANGE");
				environment.delete("TRAVIS_JOB_ID");
				environment.delete("TRAVIS_JOB_NUMBER");
			});

			it("returns the correct series", function () {
				expect(result).to.have.property("travis");
			});

			it("returns correct point", function () {
				expect(result.travis).to.deep.equal([ {
					"branch"       : branch,
					"commit"       : commit,
					"commit-range" : range,
					"job-id"       : jobId,
					"job-number"   : jobNum
				} ]);
			});
		});
	});

	describe("not in travis environment", function () {
		var result;
		var config = {};

		before(function () {
			environment.delete("TRAVIS");

			result = travis(config);
		});

		after(function () {
			environment.restore();
		});

		it("returns the correct series", function () {
			expect(result).to.have.property("travis");
		});

		it("returns no points", function () {
			expect(result.travis).to.be.empty;
		});
	});
});
