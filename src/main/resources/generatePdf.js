/*
 Usage:
 node generatePdf.js <targetUrl> <options>
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
    landscape: false,
    outputFolder: os.tmpdir(),
    outputFileName: randomString(5) + '.pdf',

    // this SHOLD BE WITHOUT 'file://' prefix otherwise cannot find the file
    inputDataFile: path.join('.', 'inputDataFile.js'),
    inputEncoding: 'utf8'
};

const targetUrl = parseTargetUrl();
const options = parseOptions();

// should be called after parseOptions
const reportInput = parseReportInput();

console.log('reportInput', reportInput);

nightmare
    .on('console', function() {
        console.log('log', options.outputFileName, arguments)
    })
    .on('page', function() {
        console.log('js-error', options.outputFileName, arguments)
    })
    .goto(targetUrl)
    .evaluate(function(input) {
        if( typeof window.onReportDataReady == 'function') {
            window.onReportDataReady(input);
        }
        else {
            console.error('onReportDataReady callback is not a function');
        }
    }, reportInput)
    .wait(options.timeout)
    .pdf(path.join(options.outputFolder, options.outputFileName), {
        pageSize: options.pageSize,
        marginsType: 1,
        printBackground: true
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
function parseReportInput() {
    let input;
    try {
        input = fs.readFileSync(options.inputDataFile, {encoding: options.inputEncoding});
        return JSON.parse(input);
    }
    catch(e) {
        console.error('input is', input);
        console.error(e);
        return {hasError: true, error: e};
    }
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
    return Object.assign({}, defaultOptions, optionsFromUser);
}

// Thanks http://stackoverflow.com/a/10727155/878361
function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
