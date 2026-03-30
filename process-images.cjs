const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const renames = {
  'Gemini_Generated_Image_t6icv1t6icv1t6ic.png': 'hero-phone-mockup.jpg',
  'Gemini_Generated_Image_r5yofr5yofr5yofr.png': 'what-is-dialogue.jpg',
  'Gemini_Generated_Image_ivl7q9ivl7q9ivl7.png': 'what-is-dialogue-alt-a.jpg',
  'Gemini_Generated_Image_how887how887how8.png': 'what-is-dialogue-alt-b.jpg',
  'Gemini_Generated_Image_tz3ztitz3ztitz3z.png': 'clarity-abstract.jpg',
  'Gemini_Generated_Image_jn1j88jn1j88jn1j.png': 'how-it-works-flow.jpg',
  'Gemini_Generated_Image_mqz8uamqz8uamqz8.png': 'privacy-visual.jpg',
  'Gemini_Generated_Image_2lt3c52lt3c52lt3.png': 'audience-contexts.jpg',
  'Gemini_Generated_Image_3ji1943ji1943ji1.png': 'vision-manifesto.jpg'
};

const srcDir = path.join(__dirname, 'Images');
const outDir = path.join(__dirname, 'public/images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processImages() {
  let html = '<html><body style="display:flex;flex-wrap:wrap;gap:20px;padding:20px;background:#eee;">';

  for (const [srcName, destName] of Object.entries(renames)) {
    const srcPath = path.join(srcDir, srcName);
    const destPath = path.join(outDir, destName);
    
    if (fs.existsSync(srcPath)) {
      console.log(`Processing ${srcName} -> ${destName}`);
      
      // Get image info
      const metadata = await sharp(srcPath).metadata();
      
      // Optimize & save
      await sharp(srcPath)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(destPath);
        
      html += `
        <div style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          <img src="/images/${destName}" style="width:300px; max-height:300px; object-fit:contain;" />
          <p style="margin:10px 0 0; font-family:sans-serif; font-size:14px; text-align:center;">
            <strong>${destName}</strong><br/>
            Original: ${metadata.width}x${metadata.height}
          </p>
        </div>
      `;
    } else {
      console.log(`Missing: ${srcPath}`);
    }
  }

  html += '</body></html>';
  fs.writeFileSync(path.join(__dirname, 'public/preview.html'), html);
  console.log('✅ Done! Open http://localhost:5174/preview.html');
}

processImages().catch(console.error);
