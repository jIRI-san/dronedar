import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkerRuntime } from "./worker-runtime";

function createSimulation() {
  const commands: string[] = [];
  let paused = true;
  let tick = 0;
  return {
    commands,
    dispatch(request: string): string {
      const parsed = JSON.parse(request) as {
        request_id: string | null;
        command: { type: string };
      };
      commands.push(parsed.command.type);
      if (parsed.command.type === "resume") paused = false;
      if (parsed.command.type === "pause") paused = true;
      if (parsed.command.type === "inject_tick" && !paused) tick += 1;
      return JSON.stringify({
        type: "telemetry",
        protocol_version: 1,
        request_id: parsed.request_id,
        telemetry: {
          tick: String(tick),
          tick_duration_us: "100000",
          simulation_time_us: String(tick * 100000),
          paused,
        },
      });
    },
  };
}

afterEach(() => vi.useRealTimers());

describe("WorkerRuntime", () => {
  it("serializes commands and schedules one injected tick per callback", async () => {
    vi.useFakeTimers();
    const simulation = createSimulation();
    const runtime = new WorkerRuntime(simulation, vi.fn(), 100);

    await runtime.dispatchRaw(
      '{"protocol_version":1,"request_id":"resume","command":{"type":"resume"}}',
    );
    await vi.advanceTimersByTimeAsync(350);
    await runtime.dispatchRaw(
      '{"protocol_version":1,"request_id":"pause","command":{"type":"pause"}}',
    );

    expect(simulation.commands).toEqual([
      "resume",
      "inject_tick",
      "inject_tick",
      "inject_tick",
      "pause",
    ]);
    runtime.dispose();
  });

  it("cancels future timer callbacks after pause without catch-up", async () => {
    vi.useFakeTimers();
    const simulation = createSimulation();
    const runtime = new WorkerRuntime(simulation, vi.fn(), 100);

    await runtime.dispatchRaw(
      '{"protocol_version":1,"request_id":"resume","command":{"type":"resume"}}',
    );
    await vi.advanceTimersByTimeAsync(100);
    await runtime.dispatchRaw(
      '{"protocol_version":1,"request_id":"pause","command":{"type":"pause"}}',
    );
    await vi.advanceTimersByTimeAsync(500);

    expect(simulation.commands).toEqual(["resume", "inject_tick", "pause"]);
    runtime.dispose();
  });
});
