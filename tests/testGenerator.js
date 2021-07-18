const pipeline = require('../dist/esm');

pipeline({
  // outputDir: 'icon_generator/icons',
  outputDir: 'tests/icons',
  svgDir: 'tests/svg',
  forceOverride: true,
  // visible: true,
  whenFinished(result) {
    // you can get the absolute path of output directory via result.outputDir
  },
});
