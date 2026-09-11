import init, { Simulation } from "./wasm/pkg/sim_wasm";
import { WorkerRuntime, type WorkerRuntimeEvent } from "./worker-runtime";

type WorkerMessage = { type: "request"; request: string };
type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null;
  postMessage(event: WorkerRuntimeEvent | { type: "ready" }): void;
};

const scope = self as unknown as WorkerScope;

async function start(): Promise<void> {
  try {
    await init();
    const runtime = new WorkerRuntime(new Simulation(), (event) => scope.postMessage(event));
    scope.onmessage = (event) => {
      if (event.data.type === "request") {
        void runtime.dispatchRaw(event.data.request);
      }
    };
    scope.postMessage({ type: "ready" });
  } catch (error: unknown) {
    scope.postMessage({
      type: "failed",
      message: error instanceof Error ? error.message : "WASM worker startup failed.",
    });
  }
}

void start();
