import { Pattern } from "fast-glob";

interface SplitterOptions {
  url?: string;
  project?: string;
}

type gqlError = {
  message: string;
};

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

type ProjectResponse = {
  data?: {
    project: {
      projectName: string;
      latestSession: string;
      sessions: Session[];
    };
  };
  errors?: gqlError[];
};

type CreateSessionResponse = {
  data?: {
    addSession: {
      sessionId: string;
      projectName: string;
    };
  };
  errors?: gqlError[];
};

type SpecInput = {
  filePath: string;
}

type NextSpecResponse = {
  data?: {
    nextSpec: string;
  };
  errors?: gqlError[];
};

declare class SplitterClient {
  readonly options: SplitterOptions;

  constructor(options?: SplitterOptions);

  project(name?: string): ProjectResponse;
  nextSpec(machineId?: string, sessionId?: string): NextSpecResponse;
  addSession(specs: SpecInput[], projectName?: string): CreateSessionResponse;
}

type SplitSpecs = {
  SplitterClient: SplitterClient,
  filesToSpecInput(includes: Pattern[], exludes: Pattern[]): SpecInput[];
}

export = SplitSpecs
