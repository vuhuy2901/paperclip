import { build } from "esbuild";
import { mkdir, readFile, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/ui", { recursive: true });
const common = { bundle: true, format: "esm", sourcemap: true, minify: false, target: "es2022" };
await build({ ...common, entryPoints: ["manifest.js"], outfile: "dist/manifest.js", platform: "node" });
await build({ ...common, entryPoints: ["src/worker.ts"], outfile: "dist/worker.js", platform: "node", external: ["@paperclipai/plugin-sdk"] });
const reactFlowStyles = await readFile("node_modules/@xyflow/react/dist/style.css", "utf8");
// Keep React external so the host and plugin share one React instance. Bundle
// react-dom because React Flow imports createPortal, which older Paperclip UI
// shims do not expose from the external react-dom module.
await build({
  ...common,
  entryPoints: ["src/ui/index.tsx"],
  outfile: "dist/ui/index.js",
  platform: "browser",
  external: ["react", "@paperclipai/plugin-sdk/ui"],
  define: { __REACT_FLOW_STYLES__: JSON.stringify(reactFlowStyles) },
  // React Flow includes CommonJS dependencies that call require("react").
  // Point those calls at Paperclip's React rather than bundling a second copy.
  banner: {
    js: 'const require = (name) => { if (name === "react") return globalThis.__paperclipPluginBridge__?.react; throw new Error(`Unsupported plugin dependency: ${name}`); };',
  },
});
