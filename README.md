# nightmare-wrapper

nightmarejs wrapper for pdf generation

Currently only works on Linux (tested on Ubuntu 16.04)

## Installation & Usage

Recommended: Use stable LTS node binary from here: https://nodejs.org/en/download/

Tested with `node.js v6.9.1 (includes npm 3.10.8)` on Ubuntu 16.04.1 LTS 64-bit (both server and desktop)

* Create a directory, for example named as `nightmareWrapperTryout`
* Install nightmarejs `npm install nightmare`
* Copy `resources/generatePdf.js` into `nightmareWrapperTryout` because otherwise it cannot be used as it would be in a jar file at runtime.
* create a symlink to node binary

The directory should be like as follows:

```
.
└── nightmareWrapperTryout
    ├── node_modules
    ├── generatePdf.js
    └── node [symlink to node binary]
```

Then the directory's full path should be passed as param as follows:

```java
Path directoryPath = Paths.get("/home/user/workspace/nightmareWrapperTryout");
new NightmareWrapper(directoryPath).generatePdf(url, optionsJson);
```

## generatePdf(url, optionsJson)

### Url

This is a `java.net.URL` mainly for url validation purpose. It is the source which will be loaded and then converted to pdf.

#### Using data from options in the HTML (optional)

If you need to use some data which should be passed by the calling process, you need to create a json file including data.
Then need to specify its full path in options as `inputDataFile`.

By default nightmare-wrapper checks `./inputDataFile.js` path to read the file, if it doesn't exist then program continues after logging the situation.

The file should contain single, valid json i.e parsable with `JSON.parse`. Its content will be parsed via `JSON.parse` and then passed to `onReportDataReady` callback.

In the HTML page you need to put your javascript into `onReportDataReady` as follows in order to use data from `inputDataFile`:

```javascript
window.onReportDataReady = function(data) {
    // your code goes here...
}
```

Of course you don't need to put any javascipt inside the callback if the code doesn't need any data from  `inputDataFile`.

### Options

This is a `Map<String, String>` which will be passed as JSON to `generatePdf.js`.

See below the default options used by `generatePdf.js`, you can override them by putting some into the options map:

```
const defaultOptions = {
  timeout: 1500, //ms

  // possible values, those are case sensitive: [A4, A3, Legal, Letter, Tabloid]
  // https://github.com/electron/electron/blob/v0.35.2/docs/api/web-contents.md#webcontentsprinttopdfoptions-callback
  pageSize: 'A4',
  marginsType: 0, // 0 means default, refer to "electron" documentation link

  landscape: false,

  outputFolder: os.tmpdir(),

  // remember to add '.pdf' suffix when you override this
  outputFileName: randomString(5) + '.pdf',

  // this SHOULD BE WITHOUT 'file://' prefix otherwise cannot find the file
  // this file should contain single, valid json. Check if it's valid via http://jsonlint.com
  inputDataFile: path.join('.', 'inputDataFile.js'),

  // available encodings: https://github.com/nodejs/node/blob/v6.9.1/lib/internal/util.js#L141
  inputEncoding: 'utf8'
};
```

You can override above options as follows:

```
Map<String, String> options = new HashMap<>();
options.put("inputDataFile", "/home/destan/Desktop/data.json");

new NightmareWrapper(directoryPath).generatePdf(templateUrl, options);
```