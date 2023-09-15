import typescript from "@rollup/plugin-typescript";
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
      typescript({
        sourceMap: true,
        inlineSources: false,
      }),
      commonjs(),
      json(),
      resolve({
        preferBuiltins: true,
        browser: false,
      }),
      !dev &&
        copy({
          targets: [
            ...(process.env.INSVEX_BUILDCONFIG_SPA === "true"
              ? []
              : [
                  {
                    src: "../frontend/build/*",
                    dest: "dist/frontend",
                  },
                ]),
            {
              src: "built.package.json",
              dest: "./dist",
              rename: "package.json",
            },
            {
              src: "config.sample.json",
              dest: "./dist",
              rename: "config.json",
            },
          ],
        }),
      !dev &&
        replace({
          "insvex.http-frontend/handler": "./frontend/handler.js",
          preventAssignment: true,
        }),
      dev &&
        run({
          execArgv: ["-r", "source-map-support/register"],
        }),
    ],
    external: [
      "insvex.http-frontend/handler",
      "./frontend/handler.js",
      "better-sqlite3",
      ...(dev ? ["fliessheck"] : []),
    ],
    output: [
      {
        dir: `dist`,
        format: "es",
        sourcemap: process.env.NODE_ENV !== 'production' ? true : false,
      },
    ],
  },
];
