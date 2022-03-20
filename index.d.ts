import { Pattern } from 'fast-glob';
export interface SplitterOptions {
    url?: string;
    project?: string;
    token?: string;
    email?: string;
    password?: string;
}

export type Spec = {
    file: string;
    estimatedDuration: number;
    passed: boolean;
    start: number;
    end: number;
};

export type Session = {
    id: string;
    start: number;
    end: number;
    backlog: Spec[];
};

export type Project = {
    projectName: string;
    latestSession: string;
    sessions: Session[];
};

export type AddSessionResponse = {
    projectName: string;
    sessionId: string;
};

export type SpecInput = {
    filePath: string;
};

export type NextSpecOptions = {
    sessionId?: string;
    machineId?: string;
    isPassed?: boolean;
};

export class SpecSplitClient {
    readonly options: SplitterOptions;

    constructor(options?: SplitterOptions);

    project(name?: string): Project;
    nextSpec(options?: NextSpecOptions): string;
    addSession(specs: SpecInput[], projectName?: string): AddSessionResponse;
}

export function filesToSpecInput(
    includes: Pattern[],
    exludes: Pattern[]
): SpecInput[];

export interface SplitSpecInfo {
    project: string;
    sessionId: string;
    machineId: string;
    url?: string;
    token?: string;
    email?: string;
    password?: string;
}

export type CypressConfig = any;
export interface ConfigFn {
    (config: CypressConfig, spec: string): CypressConfig;
}

export function cypressRun(
    splitSpecInfo: SplitSpecInfo,
    cypressConfig: CypressConfig,
    configFn?: ConfigFn
): void;
