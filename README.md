# icomoon-generator

icomoon-generator is a cross platform tool which create a new icomoon set.

Since icomoon do not provide any public API to use, you may found it's hard to integrate icomoon into your current workflow. icomoon-generator was made to solve this.

## dependencies

icomoon-generator will use your local Chrome to interact with icomoon in headless mode, so you need to make sure the latest version Chrome browser was installed.

Another dependency is the LTS version Node.js and all of those were isntalled as latest versions so we don't have any bulneralibity.

## usage

If you like to integrate icomoon-generator into your workflow, it's recommended to use in the programmatic way.
You need a folder that you keep your svg files inside of it and you need to keep its name like me on svgDir. And you can choose the output folder of generated files.

```js
// Install:
npm install --save-dev icomoon-generator
or
yarn add -D icomoon-generator

// Usage
const pipeline = require("icomoon-generator");

pipeline({
  // If you add a selectionPath file you will add the svg icons over the existing one,
  // But if you dont add a selectionPath icomoon-generator will use an empty selection.json file and will generate a new selection.json back to square one and will prepare just for the svg icons that are inside the svg folder
  selectionPath: 'icons/selection.json',
  outputDir: "icons",
  svgDir: "svg",
  forceOverride: true,
  // visible: true,
  whenFinished(result) {
    // you can get the absolute path of output directory via result.outputDir
  },
});
```

You can hack the downloaded icomoon files in a callback property `whenFinished`, or just use `Promise` to control your code since pipeline will return a promise.
