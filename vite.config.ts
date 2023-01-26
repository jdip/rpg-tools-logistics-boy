import * as fsPromises from 'fs/promises'
import type { UserConfig, ViteDevServer, Plugin, PluginOption } from 'vite'
import nested from 'postcss-nested'
import istanbul from 'vite-plugin-istanbul'
import handlebars from 'vite-plugin-handlebars'

const FixURLPlugin = (): Plugin => {
  return {
    name: 'FixURLPlugin',
    configureServer (server: ViteDevServer) {
      [
        [
          'rt-log-boy.mjs',
          'src/module.ts'
        ]
      ].forEach(([original, redirect]) => {
        server.middlewares.use(`/modules/rpg-tools-logistics-boy/${original}`, (_req, res, _next) => {
          console.log('REDIRECTING TO:', `/modules/rpg-tools-logistics-boy/${redirect}`)
          res
            .writeHead(301, {
              Location: `/modules/rpg-tools-logistics-boy/${redirect}`
            })
            .end()
        })
      })
    }
  }
}

function updateModuleManifestPlugin (): Plugin {
  return {
    name: 'update-module-manifest',
    async writeBundle (): Promise<void> {
      const moduleVersion = process.env.MODULE_VERSION
      const moduleFile = process.env.MODULE_FILE
      const githubProject = process.env.GH_PROJECT
      const githubTag = process.env.GH_TAG
      const manifestContents: string = await fsPromises.readFile(
        'src/module.json',
        'utf-8'
      )
      const manifestJson = JSON.parse(manifestContents) as Record<
      string,
      unknown
      >

      if (moduleVersion !== null && typeof moduleVersion === 'string') {
        manifestJson.version = moduleVersion
      }
      if (githubProject !== null && typeof githubProject === 'string') {
        const baseUrl = `https://github.com/${githubProject}/releases`
        manifestJson.manifest = `${baseUrl}/latest/download/module.json`
        if (
          githubTag !== null && typeof githubTag === 'string' &&
          moduleFile !== null && typeof moduleFile === 'string'
        ) {
          manifestJson.download = `${baseUrl}/download/${githubTag}/${moduleFile}.zip`
        }
      }

      await fsPromises.writeFile(
        'dist/module.json',
        JSON.stringify(manifestJson, null, 4)
      )
    }
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
        ws: true
      }
    },
    hmr: false, /* {            overlay: false,
        } */
    watch: {
      usePolling: true,
      ignored: ['**/coverage/**', '**/cypress/**', '**/dist/**', '**/.nyc_output/**']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      name: 'rt-log-boy',
      entry: 'main.ts',
      formats: ['es'],
      fileName: 'rt-log-boy'
    }
  },
  css: {
    postcss: {
      plugins: [
        nested
      ]
    },
    devSourcemap: true
  },
  plugins: [
    FixURLPlugin(),
    updateModuleManifestPlugin(),
    istanbul({
      cypress: true,
      requireEnv: false,
      exclude: ['**/coverage/**', '**/cypress/**', '**/dist/**', '**/templates/**']
    }),
    handlebars({
      reloadOnPartialChange: true
    }) as PluginOption
  ]
}

export default config
