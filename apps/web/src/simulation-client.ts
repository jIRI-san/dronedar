import type {
  Command,
  RequestEnvelope,
  ResponseEnvelope,
  Telemetry,
} from "./generated/protocol";
import type { WorkerRuntimeEvent } from "./worker-runtime";

export type LifecycleState = "starting" | "ready" | "failed" | "stopped";

type WorkerEvent = WorkerRuntimeEvent | { type: "ready" };

export interface WorkerLike {
  onmessage: ((event: MessageEvent<WorkerEvent>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: { type: "request"; request: string }): void;
  terminate(): void;
}

export class SimulationClient {
  private readonly pending = new Map<
    string,
    { resolve: (response: ResponseEnvelope) => void; reject: (error: Error) => void }
  >();
  private sequence = 0;
  private lifecycle: LifecycleState = "starting";

  public constructor(
    private readonly worker: WorkerLike,
    private readonly onState: (state: LifecycleState) => void,
    private readonly onTelemetry: (telemetry: Telemetry) => void = () => {},
  ) {
    worker.onmessage = (event) => this.handleEvent(event.data);
    worker.onerror = () => this.fail("Worker execution failed.");
    this.onState(this.lifecycle);
  }

  public get state(): LifecycleState {
    return this.lifecycle;
  }

  public command(command: Command): Promise<ResponseEnvelope> {
    return this.request({
      protocol_version: 1,
      request_id: this.nextRequestId(),
      command,
    });
  }

  public raw(request: string, requestId: string): Promise<ResponseEnvelope> {
    return this.requestRaw(request, requestId);
  }

  public dispose(): void {
    if (this.lifecycle === "stopped") {
      return;
    }
    this.lifecycle = "stopped";
    this.onState(this.lifecycle);
    this.rejectPending(new Error("Simulation transport was stopped."));
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
  }

  private request(request: RequestEnvelope): Promise<ResponseEnvelope> {
    return this.requestRaw(JSON.stringify(request), request.request_id ?? this.nextRequestId());
  }

  private requestRaw(request: string, requestId: string): Promise<ResponseEnvelope> {
    if (this.lifecycle !== "ready") {
      return Promise.reject(new Error(`Simulation transport is ${this.lifecycle}.`));
    }
    return new Promise<ResponseEnvelope>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      this.worker.postMessage({ type: "request", request });
    });
  }

  private nextRequestId(): string {
    this.sequence += 1;
    return `request-${this.sequence}`;
  }

  private handleEvent(event: WorkerEvent): void {
    if (this.lifecycle === "stopped") {
      return;
    }
    if (event.type === "ready") {
      this.lifecycle = "ready";
      this.onState(this.lifecycle);
      return;
    }
    if (event.type === "failed") {
      this.fail(event.message);
      return;
    }
    const requestId = event.response.request_id;
    if (requestId === null) {
      const telemetry = telemetryFrom(event.response);
      if (telemetry !== undefined) {
        this.onTelemetry(telemetry);
      }
      return;
    }
    const pending = this.pending.get(requestId);
    if (pending !== undefined) {
      this.pending.delete(requestId);
      pending.resolve(event.response);
    }
  }

  private fail(message: string): void {
    if (this.lifecycle === "stopped") {
      return;
    }
    this.lifecycle = "failed";
    this.onState(this.lifecycle);
    this.rejectPending(new Error(message));
  }

  private rejectPending(error: Error): void {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }
    this.pending.clear();
  }
}

export function telemetryFrom(response: ResponseEnvelope): Telemetry | undefined {
  return response.type === "telemetry" ? response.telemetry : undefined;
}
