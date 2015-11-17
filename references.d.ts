/// <reference path="typings/tsd.d.ts" />
interface IPreprocessorOptions {
  compilerOptions: any;
  transformPath?: (filepath: string) => string;
}

interface IKarmaPreprocessor {
  $inject: string[];
  (
    args: any,
    config: IPreprocessorOptions,
    logger: any,
    helper: any
  ): (
    content: string,
    file: any,
    done: (fileContent: string) => void) => NodeJS.WritableStream;
}
