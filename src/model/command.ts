export type Command =
  | OsPackage
  | DropFile
  | LineInFile;

abstract class AbstractCommand {
  abstract readonly type: string;
}

export class OsPackage extends AbstractCommand {
  readonly type: "OsPackage";
  readonly packageName: string;

  constructor(packageName: string) {
    super();
    this.packageName = packageName;
  }
}

export class DropFile extends AbstractCommand {
  readonly type: "DropFile";
  readonly path: string;
  readonly contents: string;
  readonly mode?: number;

  constructor(path: string, contents: string, mode?: number) {
    super();
    this.path = path;
    this.contents = contents;
    this.mode = mode;
  }
}

export class LineInFile extends AbstractCommand {
  readonly type: "LineInFile";
  readonly path: string;
  readonly line: string;

  constructor(path: string, line: string) {
    super();
    this.path = path;
    this.line = line;
  }
}
