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

export abstract class AbstractFileCommand extends AbstractCommand {
  readonly path: string;
  readonly mode?: number;
  protected constructor(path: string, mode?: number) {
    super();
    this.path = path;
    this.mode = mode;
  }
}

export class DropFile extends AbstractFileCommand {
  readonly type: "DropFile";
  readonly contents: string;

  constructor(path: string, contents: string, mode?: number) {
    super(path, mode);
    this.contents = contents;
  }
}

export class LineInFile extends AbstractFileCommand {
  readonly type: "LineInFile";
  readonly line: string;

  constructor(path: string, line: string) {
    super(path);
    this.line = line;
  }
}
