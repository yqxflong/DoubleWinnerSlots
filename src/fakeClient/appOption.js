/**
 * Created by liuyue on 15-6-2.
 */
var argv = require('optimist').argv;

function printHelpAndExit() {
    console.log("\n\tUsage: %s --host=[host] --port=[port] --count=[count]\n", argv["$0"]);
    process.exit(0);
}

var options = {
    host: argv["host"],
    port: argv["port"],
    count: argv["count"],
    help: argv["help"]
};

function checkOptions() {
    if (options["help"]) {
        printHelpAndExit();
    }

    if (!options.host || !options.port || !options.count) {
        printHelpAndExit();
    }
}

checkOptions();

module.exports = options;