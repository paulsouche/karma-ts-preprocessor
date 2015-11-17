/// <reference path="../references.d.ts" />
'use strict';
import * as gutil from 'gulp-util';
import * as ts from 'gulp-typescript';
import * as through from 'through2';
import * as Stream from 'stream';
import * as sourcemaps from 'gulp-sourcemaps';

const defaultOptions: IPreprocessorOptions = {
  compilerOptions: {
    target: 'es5',
    sourceMap: true
  }
};

function stringToGulpStream(filename: string, str: string): Stream.Readable {
  var src: Stream.Readable = new Stream.Readable({ objectMode: true });
  src._read = function() {
    this.push(new gutil.File({ cwd: '', base: '', path: filename, contents: new Buffer(str) }));
    this.push(null);
  };
  return src;
}

var TypeScriptPreprocessor: IKarmaPreprocessor = <IKarmaPreprocessor>function(
  args: any,
  config: IPreprocessorOptions,
  logger: any,
  helper: any) {
  var log: any, compilerOptions: any, transformPath: (filepath: string) => string;
  config = config || defaultOptions;

  log = logger.create('preprocessor.typescript');

  compilerOptions = helper.merge(defaultOptions, args.compilerOptions || {}, config.compilerOptions || {});

  transformPath = args.transformPath || config.transformPath || function(filepath) {
    return filepath.replace(/\.ts$/, '.js');
  };

  return function(content: string, file: any, done: (fileContent: string) => void) {
    var tr: NodeJS.WritableStream;

    log.debug('preprocessing "%s".', file.originalPath);
    file.path = transformPath(file.originalPath);

    tr = through.obj(function(buf, enc, cb) {
      this.push(buf.contents.toString(enc));
      return cb();
    });

    return stringToGulpStream(file.originalPath, content)
      .pipe(sourcemaps.init())
      .pipe(ts(compilerOptions))
      .pipe(sourcemaps.write())
      .pipe(tr)
      .on('data', function(data) {
        log.debug('done "%s".', file.originalPath);
        return done(data);
      });
  };
};

TypeScriptPreprocessor.$inject = ['args', 'config.typescriptPreprocessor', 'logger', 'helper'];

module.exports = {
  'preprocessor:typescript': ['factory', TypeScriptPreprocessor]
};
