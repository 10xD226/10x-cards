import { test, expect } from '@playwright/test';

test('basic user flow', async ({ page }) => {
  // Login flow
  await page.goto('/');
  await page.getByRole('button', { name: /login with github/i }).click();
  
  // Wait for successful login and redirect
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Generate questions
  const jobDescription = `Senior Frontend Developer
    Requirements:
    - 5+ years of React experience
    - TypeScript expertise
    - Next.js knowledge`;
    
  await page.getByRole('textbox').fill(jobDescription);
  await page.getByRole('button', { name: /generate/i }).click();
  
  // Verify questions are generated
  await expect(page.getByRole('table')).toBeVisible();
  const questions = await page.getByRole('row').count();
  expect(questions).toBeGreaterThan(1); // Header + at least 1 question
  
  // Mark question as practiced
  await page.getByRole('checkbox').first().click();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
}); 