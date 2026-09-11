import type {
  Command,
  RequestEnvelope,
  ResponseEnvelope,
} from "./generated/protocol";

export interface WasmSimulation {
  dispatch(request: string): string;
}

export type WorkerRuntimeEvent =
  | { type: "response"; response: ResponseEnvelope }
  | { type: "failed"; message: string };

export class WorkerRuntime {
  private queue: Promise<void> = Promise.resolve();
  private timer: ReturnType<typeof setInterval> | undefined;

  public constructor(
    private readonly simulation: WasmSimulation,
    private readonly emit: (event: WorkerRuntimeEvent) => void,
    private readonly intervalMs = 100,
  ) {}

  public dispatchRaw(request: string): Promise<void> {
    return this.enqueue(() => {
      const response = JSON.parse(this.simulation.dispatch(request)) as ResponseEnvelope;
      this.emit({ type: "response", response });
      this.updateTimer(response);
    });
  }

  public dispose(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private enqueue(operation: () => void): Promise<void> {
    this.queue = this.queue
      .then(operation)
      .catch((error: unknown) => {
        this.emit({
          type: "failed",
          message: error instanceof Error ? error.message : "Worker dispatch failed.",
        });
      });
    return this.queue;
  }

  private updateTimer(response: ResponseEnvelope): void {
    if (response.type !== "telemetry") {
      return;
    }
    if (response.telemetry.paused) {
      this.dispose();
      return;
    }
    if (this.timer === undefined) {
      this.timer = setInterval(() => {
        void this.dispatchCommand("inject_tick");
      }, this.intervalMs);
    }
  }

  private dispatchCommand(commandType: Command["type"]): Promise<void> {
    const request: RequestEnvelope = {
      protocol_version: 1,
      request_id: null,
      command: { type: commandType },
    };
    return this.dispatchRaw(JSON.stringify(request));
  }
}
