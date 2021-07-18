import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

var fs = require("fs-extra");

var path = require("path");

var extract = require("extract-zip");

var puppeteer = require("puppeteer");

var {
  exit
} = require("process");

var DEFAULT_TIMEOUT = 60000;
var DEFAULT_SELECTION_PATH = __dirname + "/selection.json";
var PAGE = {
  IMPORT_CONFIG_BUTTON: ".file.unit",
  IMPORT_SELECTION_INPUT: '.file.unit input[type="file"]',
  OVERLAY_CONFIRM: ".overlay button.mrl",
  NEW_SET_BUTTON: ".menuList1 button",
  MAIN_MENU_BUTTON: ".bar-top button .icon-menu",
  MENU_BUTTON: "h1 button .icon-menu",
  MENU: ".menuList2.menuList3",
  ICON_INPUT: '.menuList2.menuList3 .file input[type="file"]',
  FIRST_ICON_BOX: "#set0 .miBox:not(.mi-selected)",
  REMOVE_SET_BUTTON: ".menuList2.menuList3 li:last-child button",
  SELECT_ALL_BUTTON: 'button[ng-click="selectAllNone($index, true)"]',
  GENERATE_LINK: 'a[href="#/select/font"]',
  GLYPH_SET: "#glyphSet0",
  GLYPH_NAME: ".glyphName",
  DOWNLOAD_BUTTON: ".btn4"
};
var DEFAULT_OPTIONS = {
  outputDir: path.join(__dirname, "output"),
  svgDir: path.join(__dirname, "svg")
};

var logger = function logger() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log("[icomoon-generator]", ...args);
};

var sleep = time => new Promise(resolve => setTimeout(resolve, time));

var getAbsolutePath = inputPath => {
  var absoluteSelectionPath = inputPath;

  if (!path.isAbsolute(inputPath)) {
    if (!process.env.PWD) {
      process.env.PWD = process.cwd();
    }

    absoluteSelectionPath = path.resolve(process.env.PWD, inputPath);
  }

  return absoluteSelectionPath;
};

var checkDownload = dest => new Promise((resolve, reject) => {
  var interval = 1000;
  var downloadSize = 0;
  var timeCount = 0;
  var timer = setInterval( /*#__PURE__*/_asyncToGenerator(function* () {
    timeCount += interval;
    var exist = yield fs.exists(dest);

    if (!exist) {
      return;
    }

    var stats = fs.statSync(dest);

    if (stats.size > 0 && stats.size === downloadSize) {
      clearInterval(timer);
      resolve();
    } else {
      downloadSize = stats.size;
    }

    if (timeCount > DEFAULT_TIMEOUT) {
      reject("Timeout when download file, please check your network.");
    }
  }), interval);
});

var checkDuplicateName = (_ref2, forceOverride) => {
  var {
    selectionPath,
    icons,
    names
  } = _ref2;
  var iconNames = icons.map((icon, index) => {
    if (names[index]) {
      return names[index];
    }

    return path.basename(icon).replace(path.extname(icon), "");
  });
  var duplicates = [];
  var selection = fs.readJSONSync(selectionPath);
  selection.icons.forEach((_ref3, index) => {
    var {
      properties
    } = _ref3;

    if (iconNames.includes(properties.name)) {
      duplicates.push({
        name: properties.name,
        index
      });
    }
  });

  if (!duplicates.length) {
    return;
  }

  if (forceOverride) {
    selection.icons = selection.icons.filter((icon, index) => !duplicates.some(d => d.index === index));
    fs.writeJSONSync(selectionPath, selection, {
      spaces: 2
    });
  } else {
    throw new Error("Found duplicate icon names: " + duplicates.map(d => d.name).join(","));
  }
};

function pipeline(_x) {
  return _pipeline.apply(this, arguments);
}

function _pipeline() {
  _pipeline = _asyncToGenerator(function* (options) {
    if (options === void 0) {
      options = {};
    }

    try {
      var {
        selectionPath = DEFAULT_SELECTION_PATH,
        forceOverride = false,
        whenFinished,
        visible = false
      } = options;
      var outputDir = options.outputDir ? getAbsolutePath(options.outputDir) : DEFAULT_OPTIONS.outputDir;
      var svgDir = options.svgDir ? getAbsolutePath(options.svgDir) : DEFAULT_OPTIONS.svgDir; // prepare stage

      logger("Preparing...");
      var generatedIcons = yield fs.readdir(svgDir);
      var icons = generatedIcons.map(icon => options.svgDir + "/" + icon);
      var names = generatedIcons.map(icon => icon.replace(".svg", ""));

      if (!icons || !icons.length) {
        if (whenFinished) {
          whenFinished({
            outputDir
          });
        }

        return logger("No new icons found.");
      }

      if (!selectionPath) {
        throw new Error("Please config a valid selection file path.");
      }

      var absoluteSelectionPath = getAbsolutePath(selectionPath);
      checkDuplicateName({
        selectionPath: absoluteSelectionPath,
        icons,
        names
      }, forceOverride);
      var browser = yield puppeteer.launch({
        headless: !visible
      });
      logger("Started a new chrome instance, going to load icomoon.io.");
      var page = yield (yield browser).newPage();
      yield page._client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: outputDir
      });
      yield page.goto("https://icomoon.io/app/#/select");
      yield page.waitForSelector(PAGE.IMPORT_CONFIG_BUTTON);
      logger("Dashboard is visible, going to upload config file"); // remove init set

      yield page.click(PAGE.MENU_BUTTON);
      yield page.click(PAGE.REMOVE_SET_BUTTON);
      var importInput = yield page.waitForSelector(PAGE.IMPORT_SELECTION_INPUT);
      yield importInput.uploadFile(absoluteSelectionPath);
      yield page.waitForSelector(PAGE.OVERLAY_CONFIRM, {
        visible: true
      });
      yield page.click(PAGE.OVERLAY_CONFIRM);
      var selection = fs.readJSONSync(selectionPath);
      yield fs.remove(outputDir);
      yield fs.ensureDir(outputDir);

      if (selection.icons.length === 0) {
        logger("Selection icons is empty, going to create an empty set");
        yield page.click(PAGE.MAIN_MENU_BUTTON);
        yield page.waitForSelector(PAGE.NEW_SET_BUTTON, {
          visible: true
        });
        yield page.click(PAGE.NEW_SET_BUTTON);
      }

      yield sleep(1000);
      logger("Uploaded config, going to upload new icon files");
      yield page.click(PAGE.MENU_BUTTON);
      var iconInput = yield page.waitForSelector(PAGE.ICON_INPUT);
      var iconPaths = icons.map(getAbsolutePath);
      yield iconInput.uploadFile(...iconPaths);
      yield page.waitForSelector(PAGE.FIRST_ICON_BOX);
      yield page.click(PAGE.SELECT_ALL_BUTTON);
      logger("Uploaded and selected all new icons");
      yield page.click(PAGE.GENERATE_LINK);
      yield page.waitForSelector(PAGE.GLYPH_SET);

      if (names.length) {
        logger("Changed names of icons"); // sleep to ensure indexedDB is ready

        yield sleep(1000);
        yield page.evaluate(names => {
          var request = indexedDB.open("IDBWrapper-storage", 1);

          request.onsuccess = function () {
            var db = request.result;
            var tx = db.transaction("storage", "readwrite");
            var store = tx.objectStore("storage");
            var keys = store.getAllKeys();

            keys.onsuccess = function () {
              var timestamp;
              keys.result.forEach(function (key) {
                if (typeof key === "number") {
                  timestamp = key;
                }
              });
              var main = store.get(timestamp);

              main.onsuccess = function () {
                var data = main.result;

                for (var i = 0; i < names.length; i++) {
                  data.obj.iconSets[0].selection[i].name = names[i];
                }

                store.put(data);
              };
            };
          };
        }, names);
      } // sleep to ensure the code was executed


      yield sleep(1000); // reload the page let icomoon read latest indexedDB data

      yield page.reload();
      yield page.waitForSelector(PAGE.DOWNLOAD_BUTTON);
      yield page.click(PAGE.DOWNLOAD_BUTTON);
      var meta = selection.preferences.fontPref.metadata;
      var zipName = meta.majorVersion ? meta.fontFamily + "-v" + meta.majorVersion + "." + (meta.minorVersion || 0) + ".zip" : meta.fontFamily + ".zip";
      logger("Started to download " + zipName);
      var zipPath = path.join(outputDir, zipName);
      yield checkDownload(zipPath);
      logger("Successfully downloaded, going to unzip it.");
      yield page.close(); // unzip stage

      yield extract(zipPath, {
        dir: outputDir
      }).then( /*#__PURE__*/_asyncToGenerator(function* () {
        yield fs.remove(zipPath);
        logger("Finished. The output directory is " + outputDir + ".");

        if (whenFinished) {
          yield whenFinished({
            outputDir
          });
        }

        yield fs.rmSync(outputDir + "/demo-files", {
          recursive: true,
          force: true
        });
        yield fs.rmSync(outputDir + "/Read Me.txt");
        yield fs.rmSync(outputDir + "/demo.html");
        exit();
      })).catch(err => {
        if (err) {
          throw err;
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
  return _pipeline.apply(this, arguments);
}

module.exports = pipeline;
//# sourceMappingURL=index.js.map