import { Pattern } from "fast-glob";
interface SplitterOptions {
  url?: string;
  project?: string;
  token?: string;
  username?: string;
  password?: string;
}

type Spec = {
  file: string;
  estimatedDuration: number;
  start: number;
  end: number;
};

type Session = {
  id: string;
  start: number;
  end: number;
  backlog: Spec[];
};

type Project = {
  projectName: string;
  latestSession: string;
  sessions: Session[];
};

type AddSessionResponse = {
  projectName: string;
  sessionId: string;
};

type SpecInput = {
  filePath: string;
};

export class SpecSplitClient {
  readonly options: SplitterOptions;

  constructor(options?: SplitterOptions);

  project(name?: string): Project;
  nextSpec(machineId?: string, sessionId?: string): string;
  addSession(specs: SpecInput[], projectName?: string): AddSessionResponse;
}

export function filesToSpecInput(includes: Pattern[], exludes: Pattern[]): SpecInput[]