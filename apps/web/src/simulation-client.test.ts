import { describe, expect, it, vi } from "vitest";
import { SimulationClient, type WorkerLike } from "./simulation-client";

class FakeWorker implements WorkerLike {
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public readonly postMessage = vi.fn();
  public readonly terminate = vi.fn();

  public emit(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent);
  }
}

describe("SimulationClient", () => {
  it("rejects requests before worker readiness", async () => {
    const worker = new FakeWorker();
    const client = new SimulationClient(worker, vi.fn());
    await expect(client.command({ type: "step" })).rejects.toThrow("starting");
  });

  it("correlates replies and ignores late replies after disposal", async () => {
    const worker = new FakeWorker();
    const onState = vi.fn();
    const client = new SimulationClient(worker, onState);
    worker.emit({ type: "ready" });

    const response = client.command({ type: "get_clock" });
    expect(worker.postMessage).toHaveBeenCalledOnce();
    worker.emit({
      type: "response",
      response: {
        type: "telemetry",
        protocol_version: 1,
        request_id: "request-1",
        telemetry: {
          tick: "0",
          tick_duration_us: "100000",
          simulation_time_us: "0",
          paused: true,
        },
      },
    });
    await expect(response).resolves.toMatchObject({ type: "telemetry" });

    const pending = client.command({ type: "step" });
    client.dispose();
    await expect(pending).rejects.toThrow("stopped");
    worker.emit({ type: "ready" });
    expect(client.state).toBe("stopped");
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(onState).toHaveBeenLastCalledWith("stopped");
  });

  it("rejects all pending work when worker startup fails", async () => {
    const worker = new FakeWorker();
    const client = new SimulationClient(worker, vi.fn());
    worker.emit({ type: "ready" });
    const pending = client.command({ type: "step" });
    worker.emit({ type: "failed", message: "WASM was unavailable." });
    await expect(pending).rejects.toThrow("WASM was unavailable.");
    expect(client.state).toBe("failed");
  });
});
