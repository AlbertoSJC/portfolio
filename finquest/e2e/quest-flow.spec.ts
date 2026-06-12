import { test, expect } from '@playwright/test';

test.describe('core quest journey', () => {
  test('onboard, complete a quest, celebrate, and unlock an achievement', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Enter your hero name...').fill('E2E Hero');
    await page.getByRole('button', { name: /begin your adventure/i }).click();

    await expect(page.getByText('Welcome back, E2E Hero!')).toBeVisible();

    await page.getByRole('link', { name: 'Quests', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Quests', exact: true })).toBeVisible();

    const budgetQuest = page.locator('.quest-card', { hasText: 'Monthly Budget Plan' });
    await budgetQuest.getByRole('button', { name: 'Update progress' }).click();

    const progressInput = page.locator('.update-progress-controls input');
    await progressInput.fill('100');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    const celebration = page.getByRole('dialog', { name: 'Quest complete' });
    await expect(celebration).toBeVisible();
    await expect(celebration.getByText('Monthly Budget Plan')).toBeVisible();
    await expect(celebration.getByText('+200 XP')).toBeVisible();
    await celebration.click();
    await expect(celebration).not.toBeVisible();

    await expect(page.locator('.navbar-streak')).toContainText('1');

    await page.getByRole('link', { name: 'Achievements' }).click();
    await expect(page.getByText('Quest Starter')).toBeVisible();
  });

  test('dark mode preference persists across reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
