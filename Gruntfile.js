"use strict";

module.exports = function (grunt) {
	var _ = grunt.util._;

	var sourceFiles = [ "*.js", "tasks/**/*.js" ];
	var testFiles   = [ "test/**/*_spec.js" ];
	var allFiles    = sourceFiles.concat(testFiles);

	var defaultJsHintOptions = grunt.file.readJSON("./.jshint.json");
	var testJsHintOptions = _.extend(
		grunt.file.readJSON("./test/.jshint.json"),
		defaultJsHintOptions
	);

	grunt.config.init({
		jscs : {
			src     : allFiles,
			options : {
				config : ".jscs.json"
			}
		},

		jshint : {
			src     : sourceFiles,
			options : defaultJsHintOptions,
			test    : {
				options : testJsHintOptions,
				files   : {
					test : testFiles
				}
			}
		},

		watch : {
			scripts : {
				files   : allFiles,
				tasks   : [ "lint", "style" ],
				options : {
					spawn : false,
				},
			},
		},

		mochaIstanbul : {
			coverage : {
				src     : "test",
				options : {
					check : {
						// statements : 100,
						// branches   : 100,
						// lines      : 100,
						// functions  : 100
					},

					mask      : "**/*_spec.js",
					recursive : true
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-mocha-istanbul");
	grunt.loadTasks("./tasks");

	// Rename tasks
	grunt.task.renameTask("mocha_istanbul", "mochaIstanbul");

	// Register tasks
	grunt.registerTask("test", "Run all test suites.", [ "mochaIstanbul:coverage" ]);
	grunt.registerTask("lint", "Check for common code problems.", [ "jshint" ]);
	grunt.registerTask("style", "Check for style conformity.", [ "jscs" ]);
	grunt.registerTask("build", "Run all build tasks.", [ "lint", "style", "test" ]);
	grunt.registerTask("default", [ "build", "metrics" ]);

};
