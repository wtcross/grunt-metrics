grunt-metrics [![Build Status](https://travis-ci.org/wtcross/grunt-metrics.svg)](https://travis-ci.org/wtcross/grunt-metrics)
=========

> A metrics collection and reporting plugin for Grunt.

## Installation

    npm install --save-dev grunt-metrics

## Quick Usage
1. Install the plugin
2. Add ```grunt.loadNpmTasks("grunt-metrics")``` to your Gruntfile.
3. Add ```metrics``` as your last task: ```grunt.registerTask("default", [ ..., "metrics" ]);```

## Configuration

```grunt-metrics``` can be configured by adding a ```metrics``` property to your Grunt config.

### Collectors

Collectors gather information at Grunt run time. The current collectors are:

- *grunt*: task duration recording
- *npm*: package information
- *git*: git information
- *travis*: travis-ci environment variables

A collector has the following signature:

#### function [collectorName] (config) { }

| parameter | description                        |
|-----------|------------------------------------|
| config    | configuration for this collector   |

**returns** an object with the following schema:
```
{
    series : String,
    data   : Object
}
```
Configuration for a collector is looked up in ```metrics``` config using its name.

### Reporters

Reporters do something with the final metrics gathered by all collectors. The current reporters are:

- *console*: write fancy bar chart to console
- *json*: write metrics to a json file

A reporter has the following signature:

#### function [reporterName] (config, metrics) { }

| parameter | description                        |
|-----------|------------------------------------|
| config    | configuration for this reporter    |
| metrics   | metrics to report                  |

**returns** a promise that is resolved when reporting is done
Configuration for a reporter is looked up in ```metrics``` config using its name.

## Example Gruntfile
```
"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        metrics : {
            collectors : {

            },
            reporters  : {
                console : {
                    verbose : true
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-metrics");

    grunt.registerTask("test", "Do some tests", function () {
        // testing here
    });

    // Register tasks
    grunt.registerTask("default", [ "test", "metrics" ]);

};
```

## Flow

- When the plugin is loaded, it hooks the ```grunt.log.header``` method.
  - time between calls to these methods are recorded
- When the task is invoked:
  - All collectors are run at the *same* time, before reporting.
  - Results from collectors are aggregated in a metrics object like so:
    ```
    {
        result.series : result.data
    }
    ```
  - The aggregate metrics object is passed to all reporters, at the *same* time.

## Contributing

Create a PR.
