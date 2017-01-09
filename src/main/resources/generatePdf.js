/*
 Usage:
 node generatePdf.js <targetUrl> <options> <jsonData>
 */

const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });// 'show' is false by default but here for quick toggle when debugging
const os = require('os');
const path = require('path');
const fs = require('fs');

const defaultOptions = {
    timeout: 1500, //ms

    // possible values, those are case sensitive: [A4, A3, Legal, Letter, Tabloid]
    // https://github.com/electron/electron/blob/v0.35.2/docs/api/web-contents.md#webcontentsprinttopdfoptions-callback
    pageSize: 'A4',
    marginsType: 0,

    /**
     * Electron uses `landscape: false` option for orientation but we use a string value because it's more intuitive
     *
     * Available values for "orientation": 'portrait' or 'landscape'. Those values are case insensitive
     */
    orientation: 'portrait',

    outputFolder: os.tmpdir(),
    outputFileName: randomString(5) + '.pdf',

    // this SHOULD BE WITHOUT 'file://' prefix otherwise cannot find the file
    inputDataFile: path.join('.', 'inputDataFile.js'),
    inputEncoding: 'utf8'
};

const targetUrl = parseTargetUrl();
const options = parseOptions();

// should be called after parseOptions
const reportInputFromFile = parseReportInputFromFile();
console.log('reportInputFromFile', reportInputFromFile);

const reportInputFromCommandLineArgs = parseReportInputFromCommandLineArgs();
console.log('reportInputFromCommandLineArgs', reportInputFromCommandLineArgs);


nightmare
    .on('console', function() {
        console.log('log', options.outputFileName, arguments)
    })
    .on('page', function() {
        console.log('js-error', options.outputFileName, arguments)
    })
    .goto(targetUrl)
    .evaluate(function(inputFromCommandLine, inputFromFile) {
        if( typeof window.onReportDataReady == 'function') {
            window.onReportDataReady(inputFromCommandLine, inputFromFile);
        }
        else {
            console.error('onReportDataReady callback is not a function');
        }
    }, reportInputFromCommandLineArgs, reportInputFromFile)
    .wait(options.timeout)
    .pdf(path.join(options.outputFolder, options.outputFileName), {
        pageSize: options.pageSize,
        marginsType: options.marginsType,
        printBackground: true,
        printSelectionOnly: false,
        landscape: options.landscape
    })
    .end()
    .then(function () {
        console.log(options.outputFileName, 'pdf generation successful')
    })
    .catch(function (error) {
        console.error(options.outputFileName, 'failed:', error);
    });

// ==========================================================
//                Utility Functions
// ==========================================================

// should be called after parseOptions
function parseReportInputFromFile() {
    let input;
    if(fs.existsSync(options.inputDataFile)) {
        try {
            input = fs.readFileSync(options.inputDataFile, {encoding: options.inputEncoding});
            return JSON.parse(input);
        }
        catch(e) {
            console.error('parseReportInputFromFile, input:', input);
            console.error(e);
            return {hasError: true, error: e};
        }
    }
    return undefined;
}

function parseReportInputFromCommandLineArgs() {
    let input = process.argv[4];
    if(input) {
        try {
            return JSON.parse(input);
        }
        catch(e) {
            console.error('parseReportInputFromCommandLineArgs, input:', input);
            console.error(e);
            return {hasError: true, error: e};
        }
    }
    return undefined;
}

function parseTargetUrl() {
    let targetUrl = process.argv[2];
    if( !targetUrl ) {
        throw 'targetUrl is required!';
    }
    return targetUrl;
}

function parseOptions() {
    let optionsFromUser = process.argv[3];

    if(optionsFromUser) {
        try {
            optionsFromUser = JSON.parse(optionsFromUser);
        }
        catch(e) {
            console.error('user provided options:', optionsFromUser);
            console.error(e);
            return optionsFromUser;
        }
    }

    console.log('optionsFromUser', optionsFromUser);
    var options = Object.assign({}, defaultOptions, optionsFromUser);

    // map user friendly orientation value to API friendly format
    options.landscape = options.orientation.toLowerCase() == 'landscape';// this value should really be a boolean
    delete options.orientation;

    console.log('final options', options);
    return options;
}

// Thanks http://stackoverflow.com/a/10727155/878361
function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
