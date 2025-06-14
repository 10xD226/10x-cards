/**
 * Playwright Global Setup
 * Implement test hooks for setup as per test-rules
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Verify the development server is running
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  console.log(`📡 Testing connection to: ${baseURL}`);
  
  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for the app to be ready
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('✅ Application is ready for testing');
  } catch (error) {
    console.error('❌ Failed to connect to application:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

export default globalSetup; 