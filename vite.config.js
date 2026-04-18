import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import babelPresetReact from '@babel/preset-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const debugLogFilePath = path.join(__dirname, 'debug-76d30b.log')

const debugLogPlugin = () => ({
  name: 'debug-log-to-file',
  configureServer(server) {
    try {
      fs.appendFileSync(
        debugLogFilePath,
        `${JSON.stringify({
          sessionId: '76d30b',
          runId: 'vite-boot',
          hypothesisId: 'H7',
          location: 'vite.config.js:configureServer',
          message: 'vite dev server configureServer ran',
          data: { __dirname, cwd: process.cwd(), debugLogFilePath },
          timestamp: Date.now(),
        })}\n`,
        'utf8',
      )
    } catch {
      // ignore boot log failures
    }

    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0] || ''
      if (url !== '/__debug/log' || req.method !== 'POST') return next()

      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          fs.appendFileSync(debugLogFilePath, `${raw.trim()}\n`, 'utf8')
          res.statusCode = 204
          res.end()
        } catch {
          res.statusCode = 500
          res.end()
        }
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [
        reactCompilerPreset(),
        [babelPresetReact, { runtime: 'automatic' }],
      ],
    }),
    debugLogPlugin(),
  ],
})
