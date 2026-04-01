/**
 * Generates PNG icons from the SVG source for use in the Opera extension manifest.
 * Requires: sharp (installed as devDependency)
 * Run: npm run generate:icons
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svgPath = resolve(root, 'src/assets/icon.svg')
const outputDir = resolve(root, 'public/icons')

const sizes = [16, 48, 128]

mkdirSync(outputDir, { recursive: true })

const svgBuffer = readFileSync(svgPath)

for (const size of sizes) {
  const outputPath = resolve(outputDir, `icon${size}.png`)
  await sharp(svgBuffer).resize(size, size).png().toFile(outputPath)
  console.log(`✓ Generated icon${size}.png`)
}

console.log('Icons generated successfully.')
