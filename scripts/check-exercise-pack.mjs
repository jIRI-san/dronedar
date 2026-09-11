import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const exercisesRoot = join(root, "exercises");
const requiredSections = [
  "## Goal",
  "## Prerequisites",
  "## Start",
  "## Code map",
  "## Observe",
  "## Guided actions",
  "## Expected result",
  "## Explanation",
  "## Reset",
];

function fail(message) {
  console.error(`Exercise contract failed: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(exercisesRoot)) {
  fail("exercises directory is missing.");
} else {
  for (const pack of readdirSync(exercisesRoot)) {
    const packPath = join(exercisesRoot, pack);
    if (!statSync(packPath).isDirectory() || !/^\d\d-/.test(pack)) continue;

    const readme = join(packPath, "README.md");
    if (!existsSync(readme)) fail(`${relative(root, packPath)} has no README.md.`);
    const concepts = readdirSync(packPath).filter((entry) => {
      const path = join(packPath, entry);
      return statSync(path).isDirectory() && /^\d\d-/.test(entry);
    });
    if (concepts.length < 3 || concepts.length > 6) {
      fail(`${relative(root, packPath)} must contain 3-6 exercises; found ${concepts.length}.`);
    }

    for (const concept of concepts) {
      const file = join(packPath, concept, "README.md");
      if (!existsSync(file)) {
        fail(`${relative(root, packPath, concept)} has no README.md.`);
        continue;
      }
      const content = readFileSync(file, "utf8");
      for (const section of requiredSections) {
        if (!content.includes(section)) fail(`${relative(root, file)} is missing ${section}.`);
      }
      for (const target of content.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
        if (target[1].startsWith("http")) continue;
        if (!existsSync(join(packPath, concept, target[1]))) {
          fail(`${relative(root, file)} links to missing prerequisite ${target[1]}.`);
        }
      }
    }
  }
}

for (const file of [".vscode/extensions.json", ".vscode/launch.json", ".vscode/tasks.json"]) {
  if (!existsSync(join(root, file))) fail(`${file} is required for the exercise debugger matrix.`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Exercise contract passed.");
