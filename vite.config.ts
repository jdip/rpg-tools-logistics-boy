import * as fsPromises from "fs/promises";
import type { UserConfig , ViteDevServer, Plugin } from 'vite';
import copy from "rollup-plugin-copy";
import nested from 'postcss-nested';
import istanbul from "vite-plugin-istanbul";

const FixURLPlugin = (): Plugin => {
    return {
        name: 'FixURLPlugin',
        configureServer(server: ViteDevServer) {
            [
                ['logistics-boy.mjs','src/logistics-boy.ts'],
                ['templates/dogs.hbs','src/templates/dogs.hbs'],
            ].forEach(([original, redirect]) => {
                server.middlewares.use(`/modules/rpg-tools-logistics-boy/${original}`, (_req, res, next) => {
                    res.writeHead(301, {Location: `/modules/rpg-tools-logistics-boy/${redirect}`})
                    next()
                })
            })
        }
    }
}

function updateModuleManifestPlugin(): Plugin {
    return {
        name: "update-module-manifest",
        async writeBundle(): Promise<void> {
            const moduleVersion = process.env.MODULE_VERSION;
            const githubProject = process.env.GH_PROJECT;
            const githubTag = process.env.GH_TAG;
            const manifestContents: string = await fsPromises.readFile(
                "src/module.json",
                "utf-8"
            );
            const manifestJson = JSON.parse(manifestContents) as Record<
                string,
                unknown
            >;

            if (moduleVersion) {
                manifestJson["version"] = moduleVersion;
            }
            if (githubProject) {
                const baseUrl = `https://github.com/${githubProject}/releases`;
                manifestJson["manifest"] = `${baseUrl}/latest/download/module.json`;
                if (githubTag) {
                    manifestJson[
                        "download"
                        ] = `${baseUrl}/download/${githubTag}/${githubProject}-${githubTag}.zip`;
                }
            }

            await fsPromises.writeFile(
                "dist/module.json",
                JSON.stringify(manifestJson, null, 4)
            );
        },
    };
}

const config: UserConfig = {
    publicDir: 'public',
    base: '/modules/rpg-tools-logistics-boy/',
    server: {
        port: 30001,
        open: false,
        proxy: {
            '^(?!/modules/rpg-tools-logistics-boy)': 'http://localhost:30000/',
            '/socket.io': {
                target: 'ws://localhost:30000',
                ws: true,
            },
        },
        hmr: {
            overlay: false,
        },
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            name: 'logistics-boy',
            entry: 'src/main.ts',
            formats: ['es'],
            fileName: 'logistics-boy'
        }
    },
    css: {
        postcss: {
            plugins: [
                nested
            ],
        },
        devSourcemap: true,
    },
    plugins: [
        FixURLPlugin(),
        updateModuleManifestPlugin(),
        copy({
            targets: [
                { src: "src/templates", dest: "dist" },
            ],
            hook: "writeBundle",
        }),
        istanbul({
            cypress: true,
            requireEnv: false,
        }),
    ],
}

export default config;