'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ts = require('typescript');
var path = require('path');
var fs = require('fs');

var FSTree = require("fs-tree-diff");
var BroccoliPlugin = require("broccoli-plugin");
var walkSync = require("walk-sync");
var md5Hex = require("md5-hex");
var findup = require("findup");
var getCallerFile = require("get-caller-file");
var heimdall = require("heimdalljs");

var createObject = Object.create;
var newLine = ts.sys.newLine;
var useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
var getCurrentDirectory$1 = ts.sys.getCurrentDirectory;
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
function getNewLine$1() {
    return newLine;
}
var formatDiagnosticsHost = {
    getCurrentDirectory: getCurrentDirectory$1,
    getCanonicalFileName: getCanonicalFileName,
    getNewLine: getNewLine$1
};
function findConfig(root) {
    return path.join(findup.sync(root, "package.json"), "tsconfig.json");
}
function readConfig(configFile) {
    var result = ts.readConfigFile(configFile, ts.sys.readFile);
    if (result.error) {
        var message = ts.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}
function createParseConfigHost(inputPath) {
    var rootLength = inputPath.length;
    var stripRoot = function (fileName) { return fileName.slice(rootLength + 1); };
    var realPath = function (fileName) {
        console.log('parse host realPath:', fileName);
        return inputPath + fileName;
    };
    var fileExists = function (path$$1) { return ts.sys.fileExists(realPath(path$$1)); };
    var readDirectory = function (rootDir, extensions, excludes, includes) {
        console.log('parse host readDirectory:', rootDir);
        return ts.sys.readDirectory(realPath(rootDir), extensions, excludes, includes).map(stripRoot);
    };
    var readFile = function (path$$1) {
        console.log('parse host readFile:', path$$1);
        return ts.sys.readFile(realPath(path$$1));
    };
    var useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
    return {
        useCaseSensitiveFileNames: useCaseSensitiveFileNames,
        fileExists: fileExists,
        readDirectory: readDirectory,
        readFile: readFile,
    };
}
function createMap() {
    var map = createObject(null);
    map["__"] = undefined;
    delete map["__"];
    return map;
}

var SourceCache = function SourceCache(inputPath, options) {
    this.inputPath = inputPath;
    this.options = options;
    this.lastTree = undefined;
    this.cache = createMap();
    this.charset = options.charset;
    this.libFileName = ts.getDefaultLibFileName(options);
    this.libDirPath = path.dirname(ts.getDefaultLibFilePath(options));
    this.libFiles = fs.readdirSync(this.libDirPath);
};
SourceCache.prototype.updateCache = function updateCache () {
    var nextTree = FSTree.fromEntries(walkSync.entries(this.inputPath));
    var cache = this.cache;
    var lastTree = this.lastTree;
    if (lastTree) {
        lastTree.calculatePatch(nextTree).forEach(function (ref) {
                var op = ref[0];
                var path$$1 = ref[1];

            switch (op) {
                case "unlink":
                    cache["/" + path$$1] = undefined;
                    break;
                case "change":
                    var file = cache["/" + path$$1];
                    if (file) {
                        file.content = undefined;
                        file.version++;
                    }
                    break;
            }
        });
    }
    this.lastTree = nextTree;
};
SourceCache.prototype.realPath = function realPath (fileName) {
    if (this.libFiles.indexOf(fileName) > -1) {
        return path.join(this.libDirPath, fileName);
    }
    return path.join(this.inputPath, fileName);
};
SourceCache.prototype.fileExists = function fileExists (fileName) {
    return ts.sys.fileExists(this.realPath(fileName));
};
SourceCache.prototype.getScriptVersion = function getScriptVersion (fileName) {
    var file = this.cache[fileName];
    return file && file.version;
};
SourceCache.prototype.getScriptSnapshot = function getScriptSnapshot (fileName) {
    var text = this.readFile(fileName);
    return text ? ts.ScriptSnapshot.fromString(this.readFile(fileName)) : undefined;
};
SourceCache.prototype.readFile = function readFile (fileName) {
    console.log('source cache readFile:', fileName);
    var ref = this;
        var cache = ref.cache;
    var file = cache[fileName];
    if (file === undefined) {
        file = cache[fileName] = {
            content: undefined,
            version: 0
        };
    }
    var content;
    if (file.content) {
        content = file.content;
    }
    else {
        content = file.content = ts.sys.readFile(this.realPath(fileName), this.charset);
    }
    return content;
};

var OutputPatcher = function OutputPatcher(outputPath) {
    this.outputPath = outputPath;
    this.entries = [];
    this.contents = createMap();
    this.lastTree = undefined;
    this.isUnchanged = function (entryA, entryB) {
        if (entryA.isDirectory() && entryB.isDirectory()) {
            return true;
        }
        if (entryA.mode === entryB.mode && entryA.checksum === entryB.checksum) {
            return true;
        }
        return false;
    };
};
// relativePath should be without leading '/' and use forward slashes
OutputPatcher.prototype.add = function add (relativePath, content) {
    this.entries.push(new Entry(this.outputPath, relativePath, md5Hex(content)));
    this.contents[relativePath] = content;
};
OutputPatcher.prototype.patch = function patch () {
    try {
        this.lastTree = this._patch();
    }
    catch (e) {
        // walkSync(output);
        this.lastTree = undefined;
        throw e;
    }
    finally {
        this.entries = [];
        this.contents = Object.create(null);
    }
};
OutputPatcher.prototype._patch = function _patch () {
    var ref = this;
        var entries = ref.entries;
        var lastTree = ref.lastTree;
        var isUnchanged = ref.isUnchanged;
        var outputPath = ref.outputPath;
        var contents = ref.contents;
    var nextTree = FSTree.fromEntries(entries, {
        sortAndExpand: true
    });
    if (!lastTree) {
        lastTree = FSTree.fromEntries(walkSync.entries(outputPath));
    }
    var patch = lastTree.calculatePatch(nextTree, isUnchanged);
    patch.forEach(function (ref) {
            var op = ref[0];
            var path$$1 = ref[1];
            var entry = ref[2];

        switch (op) {
            case "mkdir":
                // the expanded dirs don't have a base
                fs.mkdirSync(outputPath + "/" + path$$1);
                break;
            case "rmdir":
                // the expanded dirs don't have a base
                fs.rmdirSync(outputPath + "/" + path$$1);
                break;
            case "unlink":
                fs.unlinkSync(entry.fullPath);
                break;
            case "create":
            case "change":
                fs.writeFileSync(entry.fullPath, contents[path$$1]);
                break;
        }
    });
    return nextTree;
};

var Entry = function Entry(basePath, relativePath, checksum) {
    this.basePath = basePath;
    this.relativePath = relativePath;
    this.checksum = checksum;
    this.mode = 0;
    this.size = 0;
    this.mtime = new Date();
    this.fullPath = basePath + "/" + relativePath;
    this.checksum = checksum;
};
Entry.prototype.isDirectory = function isDirectory () {
    return false;
};

var sys$1 = ts.sys;
var Compiler = function Compiler(outputPath, inputPath, rawConfig, configFileName) {
    this.outputPath = outputPath;
    this.inputPath = inputPath;
    this.rawConfig = rawConfig;
    this.configFileName = configFileName;
    var output = new OutputPatcher(outputPath);
    var config = parseConfig(inputPath, rawConfig, configFileName, undefined);
    logDiagnostics(config.errors);
    var input = new SourceCache(inputPath, config.options);
    this.output = output;
    this.config = config;
    this.input = input;
    this.host = createLanguageServiceHost(this);
    this.languageService = ts.createLanguageService(this.host, ts.createDocumentRegistry());
};
Compiler.prototype.updateInput = function updateInput (inputPath) {
    // the config builds the list of files
    var token = heimdall.start("TypeScript:updateInput");
    var config = this.config = parseConfig(inputPath, this.rawConfig, this.configFileName, this.config.options);
    logDiagnostics(config.errors);
    if (this.inputPath !== inputPath) {
        this.inputPath = inputPath;
        this.config = config;
        this.input = new SourceCache(inputPath, config.options);
    }
    else {
        this.input.updateCache();
    }
    heimdall.stop(token);
};
Compiler.prototype.compile = function compile () {
    this.createProgram();
    this.emitDiagnostics();
    this.emitProgram();
    this.patchOutput();
};
Compiler.prototype.createProgram = function createProgram () {
    var ref = this;
        var languageService = ref.languageService;
    var token = heimdall.start("TypeScript:createProgram");
    this.program = languageService.getProgram();
    heimdall.stop(token);
};
Compiler.prototype.emitDiagnostics = function emitDiagnostics () {
    // this is where bindings are resolved and typechecking is done
    var token = heimdall.start("TypeScript:emitDiagnostics");
    var diagnostics = ts.getPreEmitDiagnostics(this.program);
    logDiagnostics(diagnostics);
    heimdall.stop(token);
};
Compiler.prototype.emitProgram = function emitProgram () {
        var this$1 = this;

    var token = heimdall.start("TypeScript:emitProgram");
    var emitResult = this.program.emit(undefined, function (fileName, data) {
        this$1.output.add(fileName.slice(1), data);
    });
    logDiagnostics(emitResult.diagnostics);
    heimdall.stop(token);
};
Compiler.prototype.patchOutput = function patchOutput () {
    var token = heimdall.start("TypeScript:patchOutput");
    this.output.patch();
    heimdall.stop(token);
};

function logDiagnostics(diagnostics) {
    if (!diagnostics)
        { return; }
    sys$1.write(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost));
}
function parseConfig(inputPath, rawConfig, configFileName, previous) {
    var host = createParseConfigHost(inputPath);
    return ts.parseJsonConfigFileContent(rawConfig, host, rawConfig.compilerOptions.baseUrl, previous, configFileName);
}
function createLanguageServiceHost(compiler) {
    return {
        getCurrentDirectory: function getCurrentDirectory() {
            return process.cwd();
        },
        getCompilationSettings: function getCompilationSettings() {
            // PROBLEM: this is returning basePath: '/'
            return compiler.config.options;
        },
        getNewLine: function getNewLine() {
            return _getNewLine(compiler.config.options);
        },
        getScriptFileNames: function getScriptFileNames() {
            // PROBLEM: this is returning absolute paths
            return compiler.config.fileNames;
        },
        getScriptVersion: function getScriptVersion(fileName) {
            return "" + compiler.input.getScriptVersion(fileName);
        },
        getScriptSnapshot: function getScriptSnapshot(fileName) {
            return compiler.input.getScriptSnapshot(fileName);
        },
        getDefaultLibFileName: function getDefaultLibFileName() {
            return compiler.input.libFileName;
        },
        fileExists: function fileExists(fileName) {
            return compiler.input.fileExists(fileName);
        },
        readFile: function readFile(fileName) {
            console.log('langague host readFile:', fileName);
            return compiler.input.readFile(fileName);
        }
    };
}
function _getNewLine(options) {
    var newLine;
    if (options.newLine === undefined) {
        newLine = sys$1.newLine;
    }
    else {
        newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
    }
    return newLine;
}

var TypeScript = (function (BroccoliPlugin$$1) {
    function TypeScript(inputTree, options) {
        BroccoliPlugin$$1.call(this, [inputTree], {
            name: "broccoli-typescript-compiler",
            persistentOutput: true,
            annotation: options && options.annotation
        });
        var configFileName;
        var config;
        if (!options || !options.tsconfig) {
            configFileName = findConfig(getCallerFile(2));
            config = readConfig(configFileName);
        }
        else if (typeof options.tsconfig === "string") {
            configFileName = options.tsconfig;
            config = readConfig(configFileName);
        }
        else {
            configFileName = undefined;
            config = options.tsconfig;
        }
        this.config = config;
        this.configFileName = configFileName;
    }

    if ( BroccoliPlugin$$1 ) TypeScript.__proto__ = BroccoliPlugin$$1;
    TypeScript.prototype = Object.create( BroccoliPlugin$$1 && BroccoliPlugin$$1.prototype );
    TypeScript.prototype.constructor = TypeScript;
    TypeScript.prototype.build = function build () {
        var token = heimdall.start("TypeScript:compile");
        var inputPath = this.inputPaths[0];
        var ref = this;
        var host = ref.host;
        if (!host) {
            host = this.host = new Compiler(this.outputPath, inputPath, this.config, this.configFileName);
        }
        else {
            host.updateInput(inputPath);
        }
        host.compile();
        heimdall.stop(token);
    };

    return TypeScript;
}(BroccoliPlugin));

exports.TypeScript = TypeScript;
exports.findConfig = findConfig;
//# sourceMappingURL=plugin.js.map
