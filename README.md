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

Collectors gather information at Grunt run time. The current collectors and their options are:

- *build*: task duration recording

    *no options*

- *npm*: package information

    | option | required | description            |
    |--------|----------|------------------------|
    | path   | false    | path to `package.json` |

- *git*: git information

    *no options*

- *travis*: travis-ci environment variables

    *no options*

A collector has the following signature:

#### function collectorName (config) { }

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

Reporters do something with the final metrics gathered by all collectors. Reporters need to be enabled individually. The current reporters and their options are:

- *console*: write fancy bar chart to console

    | option    | default  | required | description                             |
    |-----------|----------|----------|-----------------------------------------|
    | enable    | false    | false    | enable this reporter                    |
    | verbose   | false    | false    | output everything                       |
    | threshold | 0.001    | false    | minimum duration to report              |
    | columns   | 80       | false    | number of columns the output should use |

- *json*: write metrics to a json file

    | option  | required | description                    |
    |---------|----------|--------------------------------|
    | path    | false    | path to write the json file to |

- *influx*: write metrics to an InfluxDB database

    | option    | default   | required | description                             |
    |-----------|-----------|----------|-----------------------------------------|
    | enable    | false     | false    | enable this reporter                    |
    | username  |   n/a     | true     | database user                           |
    | password  |   n/a     | true     | database user's password                |
    | database  |   n/a     | true     | database to write series to             |
    | host      | localhost | false    | hostname of the database                |
    | port      | 8086      | false    | port InfluxDB is listening on           |

A reporter has the following signature:

#### function reporterName (config, metrics) { }

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
