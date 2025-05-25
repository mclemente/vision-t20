import copy from "@guanghechen/rollup-plugin-copy";

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
