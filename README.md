# nightmare-wrapper

nightmarejs wrapper for pdf generation

## Usage

* Create a directory, for example named as `nightmareWrapperTryout`
* Install nightmarejs `npm install nightmare`
* Copy `resources/generatePdf.js` into `nightmareWrapperTryout` because it cannot be used otherwise as it would be in a jar file at runtime.
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
new NightmareWrapper(directoryPath).generatePdf(templateUrl, optionsJson);
```


### Options

Those are default options used by `generatePdf.js`

```
const defaultOptions = {
  timeout: 1500, //ms

  // possible values, those are case sensitive: [A4, A3, Legal, Letter, Tabloid]
  // https://github.com/electron/electron/blob/v0.35.2/docs/api/web-contents.md#webcontentsprinttopdfoptions-callback
  pageSize: 'A4',

  landscape: false,

  outputFolder: os.tmpdir(),

  // remember to add '.pdf' suffix when you override this
  outputFileName: randomString(5) + '.pdf',

  // this SHOULD BE WITHOUT 'file://' prefix otherwise cannot find the file
  // this file should contain single, valid json. Check if it's valid via http://jsonlint.com
  inputDataFile: path.join('.', 'inputDataFile.js'),

  inputEncoding: 'utf8'
};
```

You can override above options as follows:

```
Map<String, String> options = new HashMap<>();
options.put("inputDataFile", "/home/destan/Desktop/data.json");

new NightmareWrapper(directoryPath).generatePdf(templateUrl, options);
```