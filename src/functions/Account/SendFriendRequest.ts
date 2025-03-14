import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs/promises';

/**
 * Sends a friend request to the specified user using Puppeteer.
 * !! Authentication is required !!
 * @param {string | number} userId - The ID of the user to send a request to.
 * @returns {Promise<Object>}
 */
export default async (userId: string | number) => {
  const projectDir = process.cwd();
  const COOKIE_PATH = path.join(projectDir, 'auth.json');

  const cookiesString = await fs.readFile(COOKIE_PATH, 'utf-8');
  const cookies = JSON.parse(cookiesString);

  if (!cookies || cookies.length === 0) {
    throw new Error('Authentication is required for this function.');
  }

  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();

  await page.setCookie(...cookies);

  const requestUrl = `https://friends.roblox.com/v1/users/${userId}/request-friendship`;

  await page.goto(`https://www.roblox.com/users/${userId}/profile`, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Search for the element containing "Add Friend"
  const addFriendButton: any = await page.evaluate(() => {
    const result = document.evaluate(
      "//span[contains(text()='Add Friend']",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    
    // Get the first element if there are any results
    return result.snapshotLength > 0 ? result.snapshotItem(0) : null;
  });

  if (addFriendButton.length > 0) {
      await addFriendButton[0].click(); // Click the button
      await browser.close();
      return {
        status: 'Success',
      }

  } else {
    await browser.close();
    return {
        status: 'Error',
        error: 'Friend request failed',
      }
  }

};
