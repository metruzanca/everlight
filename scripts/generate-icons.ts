import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/logo.svg')

const sizes = [192, 512]
for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/logo-${size}.png`)
  console.log(`Generated logo-${size}.png`)
}

await sharp(svg).resize(32, 32).png().toFile('public/favicon.png')
console.log('Generated favicon.png')
