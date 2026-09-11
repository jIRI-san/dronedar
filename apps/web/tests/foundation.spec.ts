import { expect, test } from "@playwright/test";

test("runs the deterministic foundation flow through the real worker", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("lifecycle")).toHaveText("Transport: ready");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("clock")).toHaveText("Tick: 0 | Simulation time: 0 us");

  await page.getByRole("button", { name: "Step once" }).click();
  await expect(page.getByTestId("clock")).toHaveText(
    "Tick: 1 | Simulation time: 100000 us",
  );

  await page.getByRole("button", { name: "Resume" }).click();
  await expect
    .poll(async () => page.getByTestId("clock").textContent())
    .not.toBe("Tick: 1 | Simulation time: 100000 us");
  await page.getByRole("button", { name: "Pause" }).click();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("clock")).toHaveText("Tick: 0 | Simulation time: 0 us");

  await page.getByTestId("diagnostics").locator("summary").click();
  await page.getByRole("button", { name: "Send unsupported envelope" }).click();
  await expect(page.getByTestId("diagnostic")).toContainText("Typed error: unknown_command");
  await expect(page.getByTestId("diagnostic")).toContainText("Correlation: diagnostic-");
  await expect(page.getByTestId("diagnostic")).toContainText("Before tick: 0");
  await expect(page.getByTestId("diagnostic")).toContainText("After tick: 0");
});
