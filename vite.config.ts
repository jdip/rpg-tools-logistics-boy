import type { UserConfig, ViteDevServer } from 'vite';
import copy from "rollup-plugin-copy";
import scss from "rollup-plugin-scss";
import istanbul from "vite-plugin-istanbul";

const FixURLPlugin = {
    name: 'FixURLPlugin',
    configureServer(server: ViteDevServer) {
        server.middlewares.use('/modules/rpg-tools-logistics-boy/logistics-boy.js', (_req, res, next) => {
            res.writeHead(301, { Location: '/modules/rpg-tools-logistics-boy/src/logistics-boy.ts'})
            next()
        })
        server.middlewares.use('/modules/rpg-tools-logistics-boy/templates/dogs.hbs', (_req, res, next) => {
            res.writeHead(301, { Location: '/modules/rpg-tools-logistics-boy/src/templates/dogs.hbs'})
            next()
        })
    }
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
    plugins: [
        FixURLPlugin,
        scss({
            output: "dist/style.css",
            sourceMap: true,
            watch: ["src/styles/*.scss"],
        }),
        copy({
            targets: [
                { src: "src/module.json", dest: "dist" },
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