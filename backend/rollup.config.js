import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import run from "@rollup/plugin-run";
import copy from "rollup-plugin-copy";

const dev = process.env.ROLLUP_WATCH === "true";

export default [
  {
    input: `src/index.ts`,
    plugins: [
      esbuild({
        target: "es2022",
      }),
      commonjs(),
      json(),
      resolve({
        preferBuiltins: true,
        browser: false,
      }),
      copy({
        targets: [
          {
            src: "../frontend/build/*",
            dest: "dist/frontend",
          },
          {
            src: "built.package.json",
            dest: "./dist",
            rename: "package.json",
          },
        ],
      }),
      replace({
        "insvex.http-frontend/handler": "./frontend/handler.js",
      }),
      dev &&
        run({
          execArgv: ["-r", "source-map-support/register"],
        }),
    ],
    external: ["insvex.http-frontend/handler", "./frontend/handler.js"],
    output: [
      {
        dir: `dist`,
        format: "es",
        sourcemap: true,
      },
    ],
  },
];
