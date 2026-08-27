const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function ensureOllamaRunning(callback) {
  const req = http.get('http://localhost:11434/api/tags', (res) => {
    callback(true);
  });
  req.on('error', () => {
    console.error('⚠️ Ollama not running, starting it...');
    exec('start /B ollama serve', (err) => {
      if (err) { console.error('❌ Failed to start Ollama:', err.message); process.exit(1); }
      setTimeout(() => callback(false), 4000);
    });
  });
}

function getArg(args, name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : null;
}

function main() {
  const args = process.argv.slice(2);
  const imagePath = getArg(args, '--image');
  const prompt = getArg(args, '--prompt') || 'Describe this image in detail.';

  if (!imagePath) {
    console.error('❌ No image path provided. Use --image "path/to/image.png"');
    process.exit(1);
  }

  const fullPath = path.resolve(imagePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Image not found: ${fullPath}`);
    process.exit(1);
  }

  const imageB64 = fs.readFileSync(fullPath).toString('base64');

  const body = JSON.stringify({
    model: 'moondream',
    prompt: prompt,
    images: [imageB64],
    stream: false
  });

  ensureOllamaRunning((running) => {
  if (!running) {
    console.error('❌ Ollama failed to start. Start it manually: ollama serve');
    process.exit(1);
  }

  const req = http.request({
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(json.response || 'No response');
      } catch (e) {
        console.error('❌ Failed to parse response:', data);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    if (e.code === 'ECONNREFUSED') {
      console.error('❌ Ollama is not running. Start it with: ollama serve');
    } else {
      console.error('❌ Error:', e.message);
    }
    process.exit(1);
  });

  req.write(body);
  req.end();
  });
}

main();
