# nightmare-wrapper

nightmarejs wrapper for pdf generation

Currently only works on Linux (tested on Ubuntu 16.04)

## Installation & Usage

### Headless

Following packages are required. See [here](https://github.com/segmentio/nightmare/issues/224#issuecomment-150977951) for details. 

```bash
sudo apt update
sudo apt install -y xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib
export PATH=$PATH:$(pwd)
./npm install nightmare
```

### Common Requirements

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
    ├── node-v6.9.1-linux-x64/
    ├── generatePdf.js
    ├── inputDataFile.js
    ├── nightmare_wrapper.sh
    ├── node -> ./node-v6.9.1-linux-x64/bin/node
    └── npm -> ./node-v6.9.1-linux-x64/bin/npm
```

Then the directory's full path should be passed as param as follows:

```java
Path directoryPath = Paths.get("/home/user/workspace/nightmareWrapperTryout");
new NightmareWrapper(directoryPath).generatePdf(url, options);
```

## generatePdf(final URL url, Map<String, String> options, Map<String, Object> data)

### url

This is a `java.net.URL` mainly for url validation purpose. It is the source which will be loaded and then converted to pdf.

### options

Optional, may be null. This will be passed as JSON to `generatePdf.js`.

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
options.put("inputDataFile", "/home/user/workspace/data.json");

new NightmareWrapper(directoryPath).generatePdf(templateUrl, options);
```

### data

Optional, may be null. This will be passed as JSON to `generatePdf.js`. See below _Using data from options in the HTML_ for usage.

## Using data from options in the HTML (optional)

If you need to use some data which should be passed by the calling process, you need to create a json file including data.
Then need to specify its full path in options as `inputDataFile`.

By default nightmare-wrapper checks `./inputDataFile.js` path to read the file, if it doesn't exist then program continues after logging the situation.

The file should contain single, valid json i.e parsable with `JSON.parse`. Its content will be parsed via `JSON.parse` and then passed to `onReportDataReady` callback.

In the HTML page you need to put your javascript into `onReportDataReady` as follows in order to use data from `inputDataFile`:

```javascript
// dataFromCommandLine is undefined if "data" is null in `generatePdf`
// dataFromFile is undefined if `options.inputDataFile` is not pointing a valid file or left default
window.onReportDataReady = function(dataFromCommandLine, dataFromFile) {
    // your code goes here...
}
```

Of course you don't need to put any javascipt inside the callback if the code doesn't need any data from  `inputDataFile`.
