"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fs = require("fs-extra");

var path = require("path");

var extract = require("extract-zip");

var puppeteer = require("puppeteer");

var _require = require("process"),
    exit = _require.exit;

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
  var _console;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, ["[icomoon-generator]"].concat(args));
};

var sleep = function sleep(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

var getAbsolutePath = function getAbsolutePath(inputPath) {
  var absoluteSelectionPath = inputPath;

  if (!path.isAbsolute(inputPath)) {
    if (!process.env.PWD) {
      process.env.PWD = process.cwd();
    }

    absoluteSelectionPath = path.resolve(process.env.PWD, inputPath);
  }

  return absoluteSelectionPath;
};

var checkDownload = function checkDownload(dest) {
  return new Promise(function (resolve, reject) {
    var interval = 1000;
    var downloadSize = 0;
    var timeCount = 0;
    var timer = setInterval( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var exist, stats;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              timeCount += interval;
              _context.next = 3;
              return fs.exists(dest);

            case 3:
              exist = _context.sent;

              if (exist) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return");

            case 6:
              stats = fs.statSync(dest);

              if (stats.size > 0 && stats.size === downloadSize) {
                clearInterval(timer);
                resolve();
              } else {
                downloadSize = stats.size;
              }

              if (timeCount > DEFAULT_TIMEOUT) {
                reject("Timeout when download file, please check your network.");
              }

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })), interval);
  });
};

var checkDuplicateName = function checkDuplicateName(_ref2, forceOverride) {
  var selectionPath = _ref2.selectionPath,
      icons = _ref2.icons,
      names = _ref2.names;
  var iconNames = icons.map(function (icon, index) {
    if (names[index]) {
      return names[index];
    }

    return path.basename(icon).replace(path.extname(icon), "");
  });
  var duplicates = [];
  var selection = fs.readJSONSync(selectionPath);
  selection.icons.forEach(function (_ref3, index) {
    var properties = _ref3.properties;

    if (iconNames.includes(properties.name)) {
      duplicates.push({
        name: properties.name,
        index: index
      });
    }
  });

  if (!duplicates.length) {
    return;
  }

  if (forceOverride) {
    selection.icons = selection.icons.filter(function (icon, index) {
      return !duplicates.some(function (d) {
        return d.index === index;
      });
    });
    fs.writeJSONSync(selectionPath, selection, {
      spaces: 2
    });
  } else {
    throw new Error("Found duplicate icon names: " + duplicates.map(function (d) {
      return d.name;
    }).join(","));
  }
};

function pipeline(_x) {
  return _pipeline.apply(this, arguments);
}

function _pipeline() {
  _pipeline = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(options) {
    var _options, _options$selectionPat, selectionPath, _options$forceOverrid, forceOverride, whenFinished, _options$visible, visible, outputDir, svgDir, generatedIcons, icons, names, absoluteSelectionPath, browser, page, importInput, selection, iconInput, iconPaths, meta, zipName, zipPath;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (options === void 0) {
              options = {};
            }

            _context3.prev = 1;
            _options = options, _options$selectionPat = _options.selectionPath, selectionPath = _options$selectionPat === void 0 ? DEFAULT_SELECTION_PATH : _options$selectionPat, _options$forceOverrid = _options.forceOverride, forceOverride = _options$forceOverrid === void 0 ? false : _options$forceOverrid, whenFinished = _options.whenFinished, _options$visible = _options.visible, visible = _options$visible === void 0 ? false : _options$visible;
            outputDir = options.outputDir ? getAbsolutePath(options.outputDir) : DEFAULT_OPTIONS.outputDir;
            svgDir = options.svgDir ? getAbsolutePath(options.svgDir) : DEFAULT_OPTIONS.svgDir; // prepare stage

            logger("Preparing...");
            _context3.next = 8;
            return fs.readdir(svgDir);

          case 8:
            generatedIcons = _context3.sent;
            icons = generatedIcons.map(function (icon) {
              return options.svgDir + "/" + icon;
            });
            names = generatedIcons.map(function (icon) {
              return icon.replace(".svg", "");
            });

            if (!(!icons || !icons.length)) {
              _context3.next = 14;
              break;
            }

            if (whenFinished) {
              whenFinished({
                outputDir: outputDir
              });
            }

            return _context3.abrupt("return", logger("No new icons found."));

          case 14:
            if (selectionPath) {
              _context3.next = 16;
              break;
            }

            throw new Error("Please config a valid selection file path.");

          case 16:
            absoluteSelectionPath = getAbsolutePath(selectionPath);
            checkDuplicateName({
              selectionPath: absoluteSelectionPath,
              icons: icons,
              names: names
            }, forceOverride);
            _context3.next = 20;
            return puppeteer.launch({
              headless: !visible
            });

          case 20:
            browser = _context3.sent;
            logger("Started a new chrome instance, going to load icomoon.io.");
            _context3.next = 24;
            return browser;

          case 24:
            _context3.next = 26;
            return _context3.sent.newPage();

          case 26:
            page = _context3.sent;
            _context3.next = 29;
            return page._client.send("Page.setDownloadBehavior", {
              behavior: "allow",
              downloadPath: outputDir
            });

          case 29:
            _context3.next = 31;
            return page["goto"]("https://icomoon.io/app/#/select");

          case 31:
            _context3.next = 33;
            return page.waitForSelector(PAGE.IMPORT_CONFIG_BUTTON);

          case 33:
            logger("Dashboard is visible, going to upload config file"); // remove init set

            _context3.next = 36;
            return page.click(PAGE.MENU_BUTTON);

          case 36:
            _context3.next = 38;
            return page.click(PAGE.REMOVE_SET_BUTTON);

          case 38:
            _context3.next = 40;
            return page.waitForSelector(PAGE.IMPORT_SELECTION_INPUT);

          case 40:
            importInput = _context3.sent;
            _context3.next = 43;
            return importInput.uploadFile(absoluteSelectionPath);

          case 43:
            _context3.next = 45;
            return page.waitForSelector(PAGE.OVERLAY_CONFIRM, {
              visible: true
            });

          case 45:
            _context3.next = 47;
            return page.click(PAGE.OVERLAY_CONFIRM);

          case 47:
            selection = fs.readJSONSync(selectionPath);
            _context3.next = 50;
            return fs.remove(outputDir);

          case 50:
            _context3.next = 52;
            return fs.ensureDir(outputDir);

          case 52:
            if (!(selection.icons.length === 0)) {
              _context3.next = 60;
              break;
            }

            logger("Selection icons is empty, going to create an empty set");
            _context3.next = 56;
            return page.click(PAGE.MAIN_MENU_BUTTON);

          case 56:
            _context3.next = 58;
            return page.waitForSelector(PAGE.NEW_SET_BUTTON, {
              visible: true
            });

          case 58:
            _context3.next = 60;
            return page.click(PAGE.NEW_SET_BUTTON);

          case 60:
            _context3.next = 62;
            return sleep(1000);

          case 62:
            logger("Uploaded config, going to upload new icon files");
            _context3.next = 65;
            return page.click(PAGE.MENU_BUTTON);

          case 65:
            _context3.next = 67;
            return page.waitForSelector(PAGE.ICON_INPUT);

          case 67:
            iconInput = _context3.sent;
            iconPaths = icons.map(getAbsolutePath);
            _context3.next = 71;
            return iconInput.uploadFile.apply(iconInput, iconPaths);

          case 71:
            _context3.next = 73;
            return page.waitForSelector(PAGE.FIRST_ICON_BOX);

          case 73:
            _context3.next = 75;
            return page.click(PAGE.SELECT_ALL_BUTTON);

          case 75:
            logger("Uploaded and selected all new icons");
            _context3.next = 78;
            return page.click(PAGE.GENERATE_LINK);

          case 78:
            _context3.next = 80;
            return page.waitForSelector(PAGE.GLYPH_SET);

          case 80:
            if (!names.length) {
              _context3.next = 86;
              break;
            }

            logger("Changed names of icons"); // sleep to ensure indexedDB is ready

            _context3.next = 84;
            return sleep(1000);

          case 84:
            _context3.next = 86;
            return page.evaluate(function (names) {
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

          case 86:
            _context3.next = 88;
            return sleep(1000);

          case 88:
            _context3.next = 90;
            return page.reload();

          case 90:
            _context3.next = 92;
            return page.waitForSelector(PAGE.DOWNLOAD_BUTTON);

          case 92:
            _context3.next = 94;
            return page.click(PAGE.DOWNLOAD_BUTTON);

          case 94:
            meta = selection.preferences.fontPref.metadata;
            zipName = meta.majorVersion ? meta.fontFamily + "-v" + meta.majorVersion + "." + (meta.minorVersion || 0) + ".zip" : meta.fontFamily + ".zip";
            logger("Started to download " + zipName);
            zipPath = path.join(outputDir, zipName);
            _context3.next = 100;
            return checkDownload(zipPath);

          case 100:
            logger("Successfully downloaded, going to unzip it.");
            _context3.next = 103;
            return page.close();

          case 103:
            _context3.next = 105;
            return extract(zipPath, {
              dir: outputDir
            }).then( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return fs.remove(zipPath);

                    case 2:
                      logger("Finished. The output directory is " + outputDir + ".");

                      if (!whenFinished) {
                        _context2.next = 6;
                        break;
                      }

                      _context2.next = 6;
                      return whenFinished({
                        outputDir: outputDir
                      });

                    case 6:
                      _context2.next = 8;
                      return fs.rmSync(outputDir + "/demo-files", {
                        recursive: true,
                        force: true
                      });

                    case 8:
                      _context2.next = 10;
                      return fs.rmSync(outputDir + "/Read Me.txt");

                    case 10:
                      _context2.next = 12;
                      return fs.rmSync(outputDir + "/demo.html");

                    case 12:
                      exit();

                    case 13:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            })))["catch"](function (err) {
              if (err) {
                throw err;
              }
            });

          case 105:
            _context3.next = 110;
            break;

          case 107:
            _context3.prev = 107;
            _context3.t0 = _context3["catch"](1);
            console.error(_context3.t0);

          case 110:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 107]]);
  }));
  return _pipeline.apply(this, arguments);
}

module.exports = pipeline;
//# sourceMappingURL=index.js.map