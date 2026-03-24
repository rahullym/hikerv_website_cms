const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  await page.goto('http://localhost:4321');
  await page.waitForTimeout(3000); 
  await page.screenshot({ path: 'test_screenshot.png' });
  await browser.close();
})();
