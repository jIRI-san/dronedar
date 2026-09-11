import { ArcRotateCamera, Color4, Engine, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import type { Command, ResponseEnvelope, Telemetry } from "./generated/protocol";
import { SimulationClient, telemetryFrom, type LifecycleState } from "./simulation-client";
import "./styles.css";

const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = `
  <section aria-label="Simulation controls">
    <h1>Dronedar executable foundation</h1>
    <p id="lifecycle" data-testid="lifecycle" role="status">Transport: starting</p>
    <p id="clock" data-testid="clock">Tick: -- | Simulation time: --</p>
    <div>
      <button data-command="pause">Pause</button>
      <button data-command="resume">Resume</button>
      <button data-command="step">Step once</button>
      <button data-command="reset">Reset</button>
    </div>
    <p id="error" data-testid="error" class="error" role="alert"></p>
    <details data-testid="diagnostics">
      <summary>Learner diagnostics</summary>
      <p>Send one unsupported raw protocol envelope through the real worker.</p>
      <button id="diagnose" disabled>Send unsupported envelope</button>
      <pre id="diagnostic" data-testid="diagnostic"></pre>
    </details>
  </section>
  <section aria-label="Simulation view">
    <canvas id="scene" aria-label="Minimal Babylon.js simulation scene"></canvas>
  </section>
`;

const lifecycle = document.querySelector<HTMLElement>("#lifecycle")!;
const clock = document.querySelector<HTMLElement>("#clock")!;
const error = document.querySelector<HTMLElement>("#error")!;
const diagnostic = document.querySelector<HTMLElement>("#diagnostic")!;
const commands = document.querySelectorAll<HTMLButtonElement>("[data-command]");
const diagnose = document.querySelector<HTMLButtonElement>("#diagnose")!;

const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.04, 0.08, 0.13, 1);
const camera = new ArcRotateCamera("camera", 0, 1.1, 7, Vector3.Zero(), scene);
camera.attachControl(canvas, true);
new HemisphericLight("light", new Vector3(0, 1, 0), scene);
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

let latestTelemetry: Telemetry | undefined;
const client = new SimulationClient(
  new Worker(new URL("./simulation.worker.ts", import.meta.url), { type: "module" }),
  handleLifecycle,
  (telemetry) => {
    latestTelemetry = telemetry;
    renderTelemetry(telemetry);
  },
);

for (const button of commands) {
  button.addEventListener("click", async () => {
    await sendCommand({ type: button.dataset.command! as Command["type"] });
  });
}

diagnose.addEventListener("click", async () => {
  if (latestTelemetry?.paused !== true) {
    error.textContent = "Pause the simulation before running diagnostics.";
    return;
  }
  const before = latestTelemetry;
  const requestId = `diagnostic-${Date.now()}`;
  const request = JSON.stringify({
    protocol_version: 1,
    request_id: requestId,
    command: { type: "unsupported_for_learning" },
  });
  try {
    const response = await client.raw(request, requestId);
    const after = await sendCommand({ type: "get_clock" });
    diagnostic.textContent = [
      `Request: ${request}`,
      `Correlation: ${response.request_id ?? "uncorrelated"}`,
      `Typed error: ${response.type === "error" ? response.error.code : "unexpected telemetry"}`,
      `Before tick: ${before?.tick ?? "unknown"}`,
      `After tick: ${after?.tick ?? "unknown"}`,
    ].join("\n");
  } catch (reason: unknown) {
    error.textContent = reason instanceof Error ? reason.message : "Diagnostic failed.";
  }
});

window.addEventListener("beforeunload", () => {
  client.dispose();
  engine.dispose();
});

function handleLifecycle(state: LifecycleState): void {
  lifecycle.textContent = `Transport: ${state}`;
  updateControls(state);
  if (state === "ready") {
    void sendCommand({ type: "get_clock" });
  }
}

async function sendCommand(command: Command): Promise<Telemetry | undefined> {
  error.textContent = "";
  updateControls("starting");
  try {
    const response = await client.command(command);
    if (response.type === "error") {
      error.textContent = response.error.message;
      return undefined;
    }
    latestTelemetry = response.telemetry;
    renderTelemetry(response.telemetry);
    return response.telemetry;
  } catch (reason: unknown) {
    error.textContent = reason instanceof Error ? reason.message : "Command failed.";
    return undefined;
  } finally {
    updateControls(client.state);
  }
}

function renderTelemetry(telemetry: Telemetry): void {
  clock.textContent = `Tick: ${telemetry.tick} | Simulation time: ${telemetry.simulation_time_us} us`;
  updateControls(client.state);
}

function updateControls(state: LifecycleState): void {
  for (const button of commands) {
    const command = button.dataset.command;
    button.disabled =
      state !== "ready" ||
      (command === "pause" && latestTelemetry?.paused === true) ||
      (command === "resume" && latestTelemetry?.paused === false) ||
      (command === "step" && latestTelemetry?.paused === false);
  }
  diagnose.disabled = state !== "ready" || latestTelemetry?.paused !== true;
}
