import copy from "@guanghechen/rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import process from "process";

const isDevelopment = process.env.BUILD === "development";
const staticFiles = ["icons", "lang", "LICENSE", "module.json", "style.css"];

export default {
    input: "scripts/_index.mjs",
    output: {
        dir: "dist",
        format: "es",
        sourcemap: true,
        entryFileNames: "script.js",
        assetFileNames: "script.[ext]",
        generatedCode: "es2015",
        plugins: [terser({
            ecma: 2023,
            compress: {
                booleans: false,
                comparisons: true,
                conditionals: false,
                drop_console: isDevelopment ? false : ["assert"],
                drop_debugger: !isDevelopment,
                ecma: 2023,
                join_vars: !isDevelopment,
                keep_classnames: true,
                keep_fargs: true,
                keep_fnames: isDevelopment,
                keep_infinity: true,
                lhs_constants: !isDevelopment,
                passes: 2,
                sequences: false,
                typeofs: false,
            },
            mangle: isDevelopment ? false : { keep_classnames: true, keep_fnames: false },
            format: {
                ascii_only: true,
                beautify: isDevelopment,
                comments: false,
                keep_numbers: true,
            },
            keep_classnames: true,
            keep_fnames: isDevelopment,
        })],
    },
    plugins: [
        copy({
            targets: [
                {
                    src: staticFiles.map((f) => `./${f}`),
                    dest: "dist",
                },
            ],
        }),
    ],
};
