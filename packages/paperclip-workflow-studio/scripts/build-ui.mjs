import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const reactBridgePlugin = {
  name: "paperclip-react-bridge",
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "paperclip-react" }));
    build.onLoad({ filter: /.*/, namespace: "paperclip-react" }, () => ({
      loader: "js",
      contents: `
        const React = globalThis.__paperclipPluginBridge__?.react;
        if (!React) throw new Error("Paperclip plugin React runtime is not initialized.");
        export default React;
        export const Children = React.Children;
        export const Component = React.Component;
        export const Fragment = React.Fragment;
        export const Profiler = React.Profiler;
        export const PureComponent = React.PureComponent;
        export const StrictMode = React.StrictMode;
        export const Suspense = React.Suspense;
        export const cloneElement = React.cloneElement;
        export const createContext = React.createContext;
        export const createElement = React.createElement;
        export const createRef = React.createRef;
        export const forwardRef = React.forwardRef;
        export const isValidElement = React.isValidElement;
        export const lazy = React.lazy;
        export const memo = React.memo;
        export const startTransition = React.startTransition;
        export const use = React.use;
        export const useActionState = React.useActionState;
        export const useCallback = React.useCallback;
        export const useContext = React.useContext;
        export const useDebugValue = React.useDebugValue;
        export const useDeferredValue = React.useDeferredValue;
        export const useEffect = React.useEffect;
        export const useId = React.useId;
        export const useImperativeHandle = React.useImperativeHandle;
        export const useInsertionEffect = React.useInsertionEffect;
        export const useLayoutEffect = React.useLayoutEffect;
        export const useMemo = React.useMemo;
        export const useOptimistic = React.useOptimistic;
        export const useReducer = React.useReducer;
        export const useRef = React.useRef;
        export const useState = React.useState;
        export const useSyncExternalStore = React.useSyncExternalStore;
        export const useTransition = React.useTransition;
        export const version = React.version;
      `
    }));
  }
};

await esbuild.build({
  entryPoints: [path.join(packageRoot, "src/ui/index.tsx")],
  outfile: path.join(packageRoot, "dist/ui/index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  loader: { ".css": "text" },
  external: ["react-dom", "react/jsx-runtime", "@paperclipai/plugin-sdk/ui"],
  plugins: [reactBridgePlugin],
  logLevel: "info"
});
