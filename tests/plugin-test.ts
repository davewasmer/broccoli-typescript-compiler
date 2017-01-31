import "mocha";
import { expect } from "chai";
import { Builder } from "broccoli";
import * as path from "path";
import * as fixturify from "fixturify";
import * as os from "os";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";

import filter = require("../index");

describe("transpile TypeScript", () => {
  this.timeout(10000);

  let INPUT_PATH = path.join(os.tmpdir(), "broccoli-typescript-compiler-test");

  beforeEach(done => {
    mkdirp(INPUT_PATH, done);
  });

  afterEach(done => {
    rimraf(INPUT_PATH, done);
  });

  describe("tsconfig", () => {
    it("uses tsconfig path from options", function () {
      fixturify.writeSync(INPUT_PATH, fixturify.readSync("tests/fixtures/files"));

      let builder = new Builder(filter(INPUT_PATH, {
        tsconfig: "tests/fixtures/tsconfig.json"
      }));

      return builder.build().then(() => {
        let actual = fixturify.readSync(builder.outputPath);
        expect(actual).to.deep.equal({
          "fixtures.js": "import Greeter from './types';\nclass Person {\n    constructor(name) {\n        this._name = name;\n    }\n    name() {\n        return this._name;\n    }\n}\ndocument.body.innerHTML = new Greeter().greet(new Person(\"Godfrey\"));\n",
          "orange.js": "var orange : String;",
          "types.js": "export default class Greeter {\n    greet(thing) {\n        return \"<h1>Hello, \" + thing.name() + \"</h1>\";\n    }\n}\n;\n;\n"
        });
      }).finally(() => {
        builder.cleanup();
      });
    });

    it("uses tsconfig json from options", () => {
      fixturify.writeSync(INPUT_PATH, fixturify.readSync("tests/fixtures/files"));
      let builder = new Builder(filter(INPUT_PATH, {
        tsconfig: {
          "compilerOptions": {
            "target": "es2015",
            "module": "es2015",
            "sourceMap": false,
            "newLine": "LF"
          }
        }
      }));
      return builder.build().then(() => {
        let actual = fixturify.readSync(builder.outputPath);
        expect(actual).to.deep.equal({
          "fixtures.js": "import Greeter from './types';\nclass Person {\n    constructor(name) {\n        this._name = name;\n    }\n    name() {\n        return this._name;\n    }\n}\ndocument.body.innerHTML = new Greeter().greet(new Person(\"Godfrey\"));\n",
          "orange.js": "var orange : String;",
          "types.js": "export default class Greeter {\n    greet(thing) {\n        return \"<h1>Hello, \" + thing.name() + \"</h1>\";\n    }\n}\n;\n;\n"
        });
      }).finally(() => {
        builder.cleanup();
      });
    });

    // describe('tsconfig resolution', function() {
    //   it('basic resolution', function () {
    //     // since this uses the project tsconfig I need these in lib
    //     var Funnel = require('broccoli-funnel');
    //     var input = new Funnel(INPUT_PATH, {
    //       destDir: 'lib'
    //     });
    //     builder = new broccoli.Builder(filter(input));

    //     return builder.build().then(function(results) {
    //       var outputPath = results.directory;

    //       var actualJS = fs.readFileSync(outputPath + '/dist/fixtures.js').toString();
    //       // var actualMap = fs.readFileSync(outputPath + '/dist/fixtures.js.map').toString();
    //       var expectedJS = fs.readFileSync(expectations + '/expected.js').toString();
    //       // var expectedMap = fs.readFileSync(expectations + '/expected.js.map').toString();

    //       expect(actualJS).to.eql(expectedJS);
    //       // expect(actualMap).to.eql(expectedMap);
    //     });
    //   });
    // });
  });

  // describe('rebuilds', function() {
  //   var lastEntries, outputPath;

  //   beforeEach(function() {
  //     builder = new broccoli.Builder(filter(INPUT_PATH, {
  //       tsconfig: 'tests/fixtures/tsconfig.json'
  //     }));

  //     return builder.build().then(function(results) {
  //       outputPath = results.directory;

  //       lastEntries = walkSync.entries(outputPath);
  //       expect(lastEntries).to.have.length(3);
  //       expect(lastEntries.map(function(entry) { return entry.relativePath; })).to.deep.equals([
  //         'fixtures.js',
  //         'orange.js',
  //         'types.js'
  //       ]);
  //     });
  //   });

    // it('noop rebuild', function() {
    //   return builder.build().then(function(results) {
    //     var entries = walkSync.entries(results.directory);

    //     expect(entries).to.deep.equal(lastEntries);
    //     expect(entries).to.have.length(3);
    //   });
    // });

    // it('mixed rebuild', function() {
    //   fixturify.writeSync(INPUT_PATH, {
    //     'apple.ts': 'var apple : String',
    //     red: {
    //       'one.ts': 'var one : String',
    //     }
    //   });

    //   return builder.build().then(function(results) {
    //     var entries = walkSync.entries(results.directory);
    //     expect(entries.map(function(entry) { return entry.relativePath; })).to.deep.equals([
    //       'apple.js',
    //       'fixtures.js',
    //       'orange.js',
    //       'red/',
    //       'red/one.js',
    //       'types.js'
    //     ]);

    //     expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
    //     expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js',    lastEntries));
    //     expect(entryFor('orange.js',   entries)).to.eql(entryFor('orange.js', lastEntries));

    //     expect(entryFor('apple.js',   entries)).to.not.eql(entryFor('apple.js',   lastEntries));
    //     expect(entryFor('red/',       entries)).to.not.eql(entryFor('red/',       lastEntries));
    //     expect(entryFor('red/one.js', entries)).to.not.eql(entryFor('red/one.js', lastEntries));

    //     var update = fs.readFileSync('tests/fixtures/files/fixtures.ts', 'utf8');

    //     fixturify.writeSync(INPUT_PATH, {
    //       'apple.ts': update
    //     })

    //     lastEntries = entries;
    //     return builder.build();
    //   }).then(function (results) {
    //     var entries = walkSync.entries(results.directory);
    //     expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
    //     expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js',    lastEntries));
    //     expect(entryFor('orange.js',   entries)).to.eql(entryFor('orange.js', lastEntries));
    //     expect(entryFor('red/',        entries)).to.eql(entryFor('red/', lastEntries));
    //     expect(entryFor('red/one.js',  entries)).to.eql(entryFor('red/one.js', lastEntries));

    //     expect(entryFor('apple.js',    entries)).to.not.eql(entryFor('apple.js',   lastEntries));

    //     var expectedJS = fs.readFileSync(expectations + '/expected.es6').toString();
    //     var actualJS = fs.readFileSync(outputPath + '/apple.js').toString();

    //     expect(actualJS).to.eql(expectedJS);

    //     fixturify.writeSync(INPUT_PATH, {
    //       'apple.ts': null,
    //       red: null,
    //     });

    //     lastEntries = entries;

    //     return builder.build();
    //   }).then(function(results) {
    //     var entries = walkSync.entries(results.directory);
    //     expect(entries).to.not.deep.equal(lastEntries);
    //     expect(entries).to.have.length(3);

    //     // expected stability
    //     expect(entryFor('fixtures.js', entries)).to.eql(entryFor('fixtures.js', lastEntries));
    //     expect(entryFor('types.js',    entries)).to.eql(entryFor('types.js', lastEntries));
    //     expect(entryFor('orange.js',    entries)).to.eql(entryFor('orange.js', lastEntries));

    //     expect(entries.map(function(entry) { return entry.relativePath; })).to.deep.equals([
    //       'fixtures.js',
    //       'orange.js',
    //       'types.js'
    //     ]);
    //   });
    // });
  // });
});
