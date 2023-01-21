import type { UserConfig, ViteDevServer } from 'vite';


const FixURLPlugin = {
    name: 'login-html-fallback',
    configureServer(server: ViteDevServer) {
        server.middlewares.use('/modules/rpg-tools-logistics-boy/logistics-boy.js', (_req, res, next) => {
            res.writeHead(301, { Location: '/modules/rpg-tools-logistics-boy/src/logistics-boy.ts'})
            next()
        })
    }
}

const config: UserConfig = {
    publicDir: 'public',
    base: '/modules/rpg-tools-logistics-boy/',
    server: {
        port: 30001,
        open: true,
        proxy: {
            '^(?!/modules/rpg-tools-logistics-boy)': 'http://localhost:30000/',
            '/socket.io': {
                target: 'ws://localhost:30000',
                ws: true,
            },
        }
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
        FixURLPlugin
    ],
}

export default config;