const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  const fileArg = getArg(args, '--file') || 'index.html';
  const clicksArg = getArg(args, '--clicks');
  const doScreenshot = args.includes('--screenshot');
  const doConsole = args.includes('--console');
  const visible = args.includes('--visible');

  const projectDir = process.cwd();
  const filePath = path.resolve(projectDir, fileArg);
  const screenshotDir = path.join(projectDir, 'screenshots');

  // Create screenshots folder if missing
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
    console.log('📁 Created screenshots/ folder');
  }

  const consoleLog = [];
  const browser = await chromium.launch({ headless: !visible });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  if (doConsole) {
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLog.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => consoleLog.push(`[pageerror] ${err.message}`));
  }

  page.on('dialog', async dialog => {
    console.log(`💬 Dialog: ${dialog.type()} - "${dialog.message()}" → auto-accept`);
    await dialog.accept();
  });

  console.log(`🌐 Opening: ${filePath}`);
  page.setDefaultTimeout(5000);
  await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (doScreenshot) {
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp()}_initial.png`) });
    console.log('📸 Saved initial screenshot');
  }

  if (clicksArg) {
    const selectors = clicksArg === 'all'
      ? await page.$$eval('button', els => els.map(e => e.id || e.className || e.textContent.trim()))
      : clicksArg.split(',');

    for (const sel of selectors) {
      try {
        const trimmed = sel.trim();
        if (!trimmed) continue;

        let element;
        if (trimmed.startsWith('.')) {
          element = await page.$(trimmed);
        } else if (trimmed.startsWith('#')) {
          element = await page.$(trimmed);
        } else if (trimmed.startsWith('text=')) {
          element = await page.$(trimmed);
        } else {
          element = await page.$(`#${trimmed}`) || await page.$(`.${trimmed}`) || await page.$(`text=${trimmed}`);
        }

        if (!element) {
          console.log(`⚠️ Not found: ${trimmed}`);
          continue;
        }

        await element.click({ timeout: 5000 });
        console.log(`✅ Clicked: ${trimmed}`);
        await page.waitForTimeout(800);

        if (doScreenshot) {
          await page.screenshot({ path: path.join(screenshotDir, `${timestamp()}_after-${trimmed.replace(/[#.]/g, '')}.png`) });
        }

        // If navigation happened, reload original file
        const currentUrl = page.url();
        if (!currentUrl.startsWith('file://') || !currentUrl.includes(path.basename(filePath))) {
          console.log('🔄 Page navigated, reloading...');
          await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`❌ Error clicking ${sel}: ${e.message.split('\n')[0]}`);
        try {
          await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(300);
        } catch (_) {}
      }
    }
  }

  if (doScreenshot) {
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp()}_final.png`) });
    console.log('📸 Saved final screenshot');
  }

  if (doConsole && consoleLog.length > 0) {
    const logPath = path.join(screenshotDir, 'console-log.txt');
    fs.writeFileSync(logPath, consoleLog.join('\n'));
    console.log(`📝 Console errors saved: ${logPath}`);
    consoleLog.forEach(l => console.log(l));
  }

  await browser.close();
  console.log('✅ Done');
}

function getArg(args, name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : null;
}

const hardTimeout = setTimeout(() => {
  console.log('⏱️ Timeout reached, forcing exit');
  process.exit(1);
}, 60000);

main()
  .then(() => { clearTimeout(hardTimeout); })
  .catch(e => { console.error(e); clearTimeout(hardTimeout); process.exit(1); });
