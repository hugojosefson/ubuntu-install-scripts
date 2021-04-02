export type Progress =
  | StdoutWritten
  | StderrWritten
  | Enqueued;

export type Device = "stdout" | "stderr";

export abstract class AbstractStringWritten<T extends Device> {
  abstract readonly device: T;
  readonly string: string;
}

export class StdoutWritten extends AbstractStringWritten<"stdout"> {
  readonly device: "stdout";
  constructor(string: string) {
    super();
    this.string = string;
  }
}

export class StderrWritten extends AbstractStringWritten<"stderr"> {
  readonly device: "stderr";
  constructor(string: string) {
    super();
    this.string = string;
  }
}
