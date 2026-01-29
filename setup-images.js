#!/usr/bin/env node

/**
 * Image Optimization Setup Helper
 * 
 * This script helps you set up your images for Lighthouse 95+
 * It expects JPEG/PNG files and converts them to WebP + optimized JPEG
 * 
 * Usage:
 *   node setup-images.js "path/to/bridal.jpg" "path/to/evening.jpg" "path/to/floral.jpg"
 * 
 * Example:
 *   node setup-images.js "C:\Downloads\bridal.jpg" "C:\Downloads\evening.jpg" "C:\Downloads\flowers.jpg"
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
⚠️  No images provided!

Usage:
  node setup-images.js <bridal-image> <evening-image> <floral-image>

Example:
  node setup-images.js "C:\\Downloads\\bridal.jpg" "C:\\Downloads\\evening.jpg" "C:\\Downloads\\flowers.jpg"

This will:
1. Resize images to optimized dimensions
2. Convert to WebP (25-35% smaller)
3. Create JPEG fallbacks
4. Place all in /public/images/

Images will be optimized for Lighthouse 95+ performance!
  `);
  process.exit(1);
}

const [bridalInput, eveningInput, floralInput] = args;

const IMAGES_DIR = path.join(__dirname, 'public', 'images');

// Create directory
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const imageConfigs = [
  {
    input: bridalInput,
    name: 'hero-bridal',
    width: 1200,
    height: 800,
    description: 'Main hero background (full-width)',
  },
  {
    input: eveningInput,
    name: 'hero-evening',
    width: 400,
    height: 525,
    description: 'Evening gown accent (upper-right, desktop)',
  },
  {
    input: floralInput,
    name: 'hero-floral',
    width: 336,
    height: 456,
    description: 'Floral arrangement accent (bottom-right, desktop)',
  },
];

async function processImage(config) {
  if (!fs.existsSync(config.input)) {
    console.error(`\n❌ Not found: ${config.input}`);
    return false;
  }

  console.log(`\n📦 ${config.description}`);
  console.log(`   Input: ${path.basename(config.input)}`);
  console.log(`   Size: ${config.width}×${config.height}`);

  try {
    // Convert to WebP
    const webpPath = path.join(IMAGES_DIR, `${config.name}.webp`);
    await sharp(config.input)
      .resize(config.width, config.height, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    console.log(`   ✅ ${config.name}.webp (${(webpStats.size / 1024).toFixed(1)} KB)`);

    // Convert to JPEG
    const jpegPath = path.join(IMAGES_DIR, `${config.name}.jpg`);
    await sharp(config.input)
      .resize(config.width, config.height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80, progressive: true })
      .toFile(jpegPath);

    const jpegStats = fs.statSync(jpegPath);
    console.log(`   ✅ ${config.name}.jpg (${(jpegStats.size / 1024).toFixed(1)} KB)`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n🖼️  Image Optimization for Lighthouse 95+\n`);
  console.log(`Target directory: ${IMAGES_DIR}\n`);

  let success = 0;
  for (const config of imageConfigs) {
    if (await processImage(config)) {
      success++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  if (success === imageConfigs.length) {
    console.log(`\n✨ All images optimized successfully!\n`);
    console.log(`Next steps:`);
    console.log(`1. Test locally: npm run dev`);
    console.log(`2. Check images load: http://localhost:3000`);
    console.log(`3. Run Lighthouse: Chrome DevTools → Lighthouse`);
    console.log(`\n🎉 You're ready for Lighthouse 95+!\n`);
  } else {
    console.log(`\n⚠️  ${success}/${imageConfigs.length} images processed.`);
    console.log(`Check errors above and retry.\n`);
  }
}

main().catch(console.error);
