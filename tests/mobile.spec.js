import { test, expect } from '@playwright/test';

test('Mobile UI screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:5173');
  await page.click('.sample-button');
  await page.waitForSelector('#diagram-target svg');
  await page.screenshot({ path: 'mobile-screenshot.png' });
});
