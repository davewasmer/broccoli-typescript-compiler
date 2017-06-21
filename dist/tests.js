'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = require('tslib');
var broccoliTestHelper = require('broccoli-test-helper');
var fs = require('fs');
var ts = require('typescript');
var path = require('path');

var index = require('./index');
var ConfigParser = index.ConfigParser;
var InputIO = index.InputIO;
var PathResolver = index.PathResolver;
var normalizePath$1 = index.normalizePath;

var toPath$1 = index.toPath;



var typescript = index.typescript;

var testCasesDir = broccoliTestHelper.createReadableDir("tests/cases");
var testCases = fs.readdirSync(testCasesDir.path());
var expectationsDir = broccoliTestHelper.createReadableDir("tests/expectations");
// tslint:disable-next-line:only-arrow-functions
QUnit.module("plugin-cases", function () {
    var this$1 = this;

    testCases.forEach(function (testCase) {
        QUnit.test(testCase.replace("-", " "), function (assert) { return tslib_1.__awaiter(this$1, void 0, void 0, function* () {
            var tree = testCasesDir.read(testCase);
            delete tree["tsconfig.json"];
            var input = yield broccoliTestHelper.createTempDir();
            input.write(tree);
            var output = broccoliTestHelper.createBuilder(typescript(input.path(), {
                compilerOptions: {
                    noEmitOnError: true,
                },
                tsconfig: testCasesDir.path(testCase + "/tsconfig.json"),
            }));
            yield output.build();
            assert.deepEqual(output.read(), expectationsDir.read(testCase));
        }); });
    });
});

var root;
var input;
/* tslint:disable:object-literal-sort-keys */
/* tslint:disable:object-literal-key-quotes */
QUnit.module("config-parser", {
    beforeEach: function beforeEach() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var assign;
            (assign = yield Promise.all([
                broccoliTestHelper.createTempDir(),
                broccoliTestHelper.createTempDir() ]), root = assign[0], input = assign[1]);
        });
    },
    afterEach: function afterEach() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                root.dispose(),
                input.dispose() ]);
        });
    },
}, function () {
    QUnit.module("extended config", {
        beforeEach: function beforeEach() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                root.write({
                    "tsconfig.json": "{\n          \"compilerOptions\": {\n            \"moduleResolution\": \"node\",\n            \"outDir\": \"dist\",\n            \"types\": [\"foo\"],\n            \"typeRoots\": [\n              \"typings\"\n            ]\n          }\n        }",
                    "lib": {
                        "tsconfig.json": "{\n            \"extends\": \"../tsconfig.json\",\n            \"compilerOptions\": {\n              \"strictNullChecks\": true\n            }\n          }",
                        "b.ts": "export class B {};",
                    },
                    "typings": {
                        "foo": {
                            "index.d.ts": "export default class Foo {};",
                        },
                    },
                });
                input.write({
                    "lib": {
                        "a.ts": "export class A {};",
                    },
                });
            });
        },
    }, function () {
        QUnit.test("should be able to find the extended config", function (assert) {
            var rootPath = toPath$1(root.path());
            var inputPath = toPath$1(input.path());
            var parser = new ConfigParser(rootPath, undefined, "lib/tsconfig.json", { module: "umd" }, new InputIO(new PathResolver(rootPath, inputPath)));
            var parsed = parser.parseConfig();
            assert.deepEqual(parsed.errors, []);
            assert.deepEqual(parsed.options, {
                "configFilePath": toPath$1("lib/tsconfig.json", rootPath),
                "module": ts.ModuleKind.UMD,
                "moduleResolution": ts.ModuleResolutionKind.NodeJs,
                "outDir": toPath$1("dist", rootPath),
                "strictNullChecks": true,
                "typeRoots": [
                    toPath$1("typings", rootPath) ],
                "types": ["foo"],
            });
            assert.deepEqual(parsed.fileNames, [
                toPath$1("lib/a.ts", rootPath) ]);
        });
    });
});

var getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
    ? function (fileName) { return fileName; }
    : function (fileName) { return fileName.toLowerCase(); };
var defaultLibLocation = ts.getDirectoryPath(toPath$2(ts.sys.getExecutingFilePath()));
function normalizePath$2(path$$1) {
    if (path$$1.length === 0) {
        return path$$1;
    }
    return trimTrailingSlash(getCanonicalFileName(ts.normalizePath(path$$1)));
}

function relativePathWithin$1(root, path$$1) {
    var relativePath;
    if (path$$1.length > root.length &&
        path$$1.lastIndexOf(root, 0) === 0 &&
        path$$1.charCodeAt(root.length) === 47 /* Slash */) {
        relativePath = path$$1.substring(root.length + 1);
    }
    else if (path$$1 === root) {
        relativePath = "";
    }
    return relativePath;
}
function toPath$2(fileName, basePath) {
    var p = ts.toPath(fileName, basePath === undefined ?
        currentDirectory() : basePath, getCanonicalFileName);
    return trimTrailingSlash(p);
}
function trimTrailingSlash(path$$1) {
    if (path$$1.charCodeAt(path$$1.length - 1) === 47 /* Slash */) {
        return path$$1.slice(0, path$$1.length - 1);
    }
    return path$$1;
}
function currentDirectory() {
    return normalizePath$2(process.cwd());
}

QUnit.module("path-utils", function () {
    QUnit.test("relativePathWithin", function (assert) {
        var a = toPath$2("a");
        var b = toPath$2("a/b");
        assert.strictEqual(relativePathWithin$1(a, b), "b");
        assert.strictEqual(relativePathWithin$1(b, a), undefined);
    });
});

// tslint:disable-next-line:only-arrow-functions
QUnit.module("plugin-rebuild", function () {
    var this$1 = this;

    QUnit.test("compiles basic typescript", function (assert) { return tslib_1.__awaiter(this$1, void 0, void 0, function* () {
        var input = yield broccoliTestHelper.createTempDir();
        try {
            input.write({
                "a.ts": "export default class A {}",
                "index.ts": "export { default as A } from \"./a\";",
            });
            var plugin = typescript(input.path(), {
                tsconfig: {
                    compilerOptions: {
                        module: "commonjs",
                        moduleResolution: "node",
                        newLine: "LF",
                        target: "es2015",
                    },
                    files: ["index.ts"],
                },
            });
            var output = broccoliTestHelper.createBuilder(plugin);
            try {
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "a.js": "create",
                    "index.js": "create",
                });
                assert.deepEqual(output.read(), {
                    "a.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass A {\n}\nexports.default = A;\n",
                    "index.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar a_1 = require(\"./a\");\nexports.A = a_1.default;\n",
                });
                input.write({
                    "b.ts": "export default class B {}",
                    "index.ts": "export { default as A } from \"./a\";\nexport { default as B } from \"./b\"",
                });
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "b.js": "create",
                    "index.js": "change",
                });
                assert.deepEqual(output.read(), {
                    "a.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass A {\n}\nexports.default = A;\n",
                    "b.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass B {\n}\nexports.default = B;\n",
                    "index.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar a_1 = require(\"./a\");\nexports.A = a_1.default;\nvar b_1 = require(\"./b\");\nexports.B = b_1.default;\n",
                });
                yield output.build();
                assert.deepEqual(output.changes(), {});
                input.write({
                    "b.ts": null,
                    "index.ts": "export { default as A } from \"./a\";",
                });
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "b.js": "unlink",
                    "index.js": "change",
                });
                assert.deepEqual(output.read(), {
                    "a.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass A {\n}\nexports.default = A;\n",
                    "index.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar a_1 = require(\"./a\");\nexports.A = a_1.default;\n",
                });
            }
            finally {
                yield output.dispose();
            }
        }
        finally {
            yield input.dispose();
        }
    }); });
    QUnit.test("handles missing files", function (assert) { return tslib_1.__awaiter(this$1, void 0, void 0, function* () {
        var input = yield broccoliTestHelper.createTempDir();
        try {
            input.write({
                "index.ts": "export { default as A } from \"./a\";",
            });
            var output = broccoliTestHelper.createBuilder(typescript(input.path(), {
                tsconfig: {
                    compilerOptions: {
                        module: "commonjs",
                        moduleResolution: "node",
                        newLine: "LF",
                        target: "es2015",
                    },
                    files: ["index.ts"],
                },
            }));
            try {
                yield output.build();
                assert.deepEqual(output.read(), {
                    "index.js": "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar a_1 = require(\"./a\");\nexports.A = a_1.default;\n",
                });
            }
            finally {
                yield output.dispose();
            }
        }
        finally {
            yield input.dispose();
        }
    }); });
});

// tslint:disable:max-classes-per-file
var ProjectRunner = function ProjectRunner(config) {
    var rootDir = path.resolve(config.typescriptDir);
    this.rootDir = rootDir;
    this.projectJsonDir = path.join(rootDir, "tests/cases/project");
};
ProjectRunner.prototype.each = function each (callback) {
        var this$1 = this;

    var ref = this;
        var rootDir = ref.rootDir;
        var projectJsonDir = ref.projectJsonDir;
    var entries = fs.readdirSync(projectJsonDir);
    for (var i = 0, list = entries; i < list.length; i += 1) {
        var entry = list[i];

            var extname$$1 = path.extname(entry);
        if (extname$$1 === ".json") {
            var configPath = path.join(projectJsonDir, entry);
            var config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            var basename$$1 = path.basename(entry, extname$$1);
            if (this$1.shouldSkip(basename$$1, config)) {
                continue;
            }
            callback(new Project(rootDir, basename$$1, config));
        }
    }
};
ProjectRunner.prototype.shouldSkip = function shouldSkip (basename$$1, config) {
    return basename$$1 === "invalidRootFile" ||
        /^mapRootRelativePath/.test(basename$$1) ||
        /^sourceRootRelativePath/.test(basename$$1) ||
        (/^maprootUrl/.test(basename$$1) && !/^maprootUrlsourcerootUrl/.test(basename$$1)) ||
        /^maprootUrlSubfolder/.test(basename$$1) ||
        /^referenceResolutionRelativePaths/.test(basename$$1) ||
        basename$$1 === "rootDirectory" ||
        basename$$1 === "rootDirectoryWithSourceRoot" ||
        !config.baselineCheck ||
        config.resolveMapRoot ||
        config.resolveSourceRoot;
};

var Project = function Project(rootDir, basename$$1, config) {
    this.rootDir = rootDir;
    this.basename = basename$$1;
    this.config = config;
};

var prototypeAccessors = { dir: {},tsconfigFile: {},inputFiles: {},compilerOptions: {} };
Project.prototype.each = function each (callback) {
    callback(new ProjectWithModule(this, "amd"));
    callback(new ProjectWithModule(this, "commonjs"));
};
prototypeAccessors.dir.get = function () {
    return path.join(this.rootDir, this.config.projectRoot);
};
prototypeAccessors.tsconfigFile.get = function () {
    if (this.config.project) {
        return path.join(this.config.project, "tsconfig.json");
    }
};
prototypeAccessors.inputFiles.get = function () {
    return this.config.inputFiles;
};
prototypeAccessors.compilerOptions.get = function () {
    var ref = this;
        var config = ref.config;
    var compilerOptions = {};
    ts.optionDeclarations.forEach(function (opt) {
        var name = opt.name;
        if (name in config) {
            compilerOptions[name] = config[name];
        }
    });
    return compilerOptions;
};

Object.defineProperties( Project.prototype, prototypeAccessors );
var ProjectWithModule = function ProjectWithModule(project, module) {
    this.project = project;
    this.module = module;
};

var prototypeAccessors$1 = { baselineDir: {},compilerOptions: {},pluginConfig: {},baseline: {} };
prototypeAccessors$1.baselineDir.get = function () {
    return broccoliTestHelper.createReadableDir(path.join(this.project.rootDir, "tests/baselines/reference/project", this.project.basename, this.module === "amd" ? "amd" : "node"));
};
prototypeAccessors$1.compilerOptions.get = function () {
    return Object.assign(this.project.compilerOptions, {
        module: this.module,
        moduleResolution: "classic",
        newLine: "CRLF",
        typeRoots: [],
    });
};
prototypeAccessors$1.pluginConfig.get = function () {
    var ref = this;
        var project = ref.project;
    var inputFiles = project.inputFiles;
    var tsconfigFile = project.tsconfigFile;
    var config = {
        compilerOptions: this.compilerOptions,
        rootPath: this.project.dir,
    };
    if (tsconfigFile) {
        config.tsconfig = tsconfigFile;
    }
    else if (inputFiles) {
        config.tsconfig = { files: inputFiles };
    }
    return config;
};
prototypeAccessors$1.baseline.get = function () {
    return new Baseline(this.baselineDir.read(), this.project.basename);
};

Object.defineProperties( ProjectWithModule.prototype, prototypeAccessors$1 );
var Baseline = function Baseline(tree, basename$$1) {
    var configName = basename$$1 + ".json";
    var errorsName = basename$$1 + ".errors.txt";
    var sourcemapName = basename$$1 + "sourcemap.txt";
    var config = JSON.parse(tree[configName]);
    this.config = config;
    this.errors = tree[errorsName];
    this.sourcemap = tree[errorsName];
    delete tree[configName];
    delete tree[errorsName];
    delete tree[sourcemapName];
    this.output = cleanExpectedTree(tree, config.emittedFiles);
};
function normalizeTree(baseline) {
    var normalized = {};
    var files = Object.keys(baseline);
    for (var i$1 = 0, list = files; i$1 < list.length; i$1 += 1) {
        var file = list[i$1];

        var value = baseline[file];
        if (typeof value === "object" && value !== null) {
            value = normalizeTree(value);
        }
        else if (typeof value === "string" && path.extname(file) === ".map") {
            var sourceMapData = JSON.parse(value);
            for (var i = 0; i < sourceMapData.sources.length; i++) {
                sourceMapData.sources[i] = normalizePath$1(sourceMapData.sources[i]);
            }
            value = JSON.stringify(sourceMapData);
        }
        normalized[normalizePath$1(file)] = value;
    }
    return normalized;
}
function cleanExpectedTree(baseline, emittedFiles) {
    var clean = {};
    if (emittedFiles) {
        var normalized = normalizeTree(baseline);
        for (var i = 0, list = emittedFiles; i < list.length; i += 1) {
            var emittedFile = list[i];

            var parts = normalizePath$1(emittedFile).split("/");
            var src = normalized;
            var target = clean;
            for (var i$1 = 0, list$1 = parts; i$1 < list$1.length; i$1 += 1) {
                var part = list$1[i$1];

                if (typeof target !== "object" ||
                    target === null ||
                    typeof src !== "object" ||
                    src === null) {
                    continue;
                }
                if (part === "..") {
                    // we can let you escape the outputPath
                    // TODO, maybe support compilerOptions.project as a way to make this pass
                    // tslint:disable:no-console
                    console.warn(emittedFile);
                    break;
                }
                target[part] = src[part];
                src = src[part];
                target = target[part];
            }
        }
    }
    return clean;
}

// tslint:disable:no-console
var runner = new ProjectRunner({
    typescriptDir: "vendor/typescript",
});
// tslint:disable:only-arrow-functions
QUnit.module("typescript-project-cases", function () {
    runner.each(function (project) {
        QUnit.module(project.basename, function () {
            project.each(function (mod) {
                QUnit.test(mod.module, function (assert) {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        var input = yield broccoliTestHelper.createTempDir();
                        try {
                            input.copy(project.dir);
                            var plugin = typescript(input.path(), mod.pluginConfig);
                            var output = broccoliTestHelper.createBuilder(plugin);
                            try {
                                yield output.build();
                                var actual = output.read();
                                var baseline = mod.baseline;
                                assert.deepEqual(actual, baseline.output);
                            }
                            finally {
                                yield output.dispose();
                            }
                        }
                        finally {
                            yield input.dispose();
                        }
                    });
                });
            });
        });
    });
});

exports.Project = Project;
exports.ProjectWithModule = ProjectWithModule;
exports.Baseline = Baseline;
//# sourceMappingURL=tests.js.map
