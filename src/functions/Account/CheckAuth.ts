import axios from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs/promises'


/* Checks if your current authentication file is valid. */
/** @returns {Object} */

export default async () => {
  const projectDir = process.cwd();
  // Define paths for cookies and QR codes
  const COOKIE_PATH = path.join(projectDir, 'auth.json');
  const cookiesString = await fs.readFile(COOKIE_PATH, "utf-8");
  const cookies = JSON.parse(cookiesString);

  const cookieString = cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join("; ");

  const res = await axios.get('https://www.roblox.com/home', {
    headers: {
      Cookie: cookies
    },
  });

  const html = res.data;
  const $ = cheerio.load(html);
  const userData = $('meta[name="user-data"]');

  const userId: string | undefined = userData.attr('data-userid');
  const userName: string | undefined = userData.attr('data-name');
  const displayName: string | undefined = userData.attr('data-displayName');
  const isUnder13: string | undefined = userData.attr('data-isunder13');
  const createdDate: string | undefined = userData.attr('data-created');
  const isPremiumUser: string | undefined = userData.attr('data-ispremiumuser');
  const hasVerifiedBadge: string | undefined = userData.attr('data-hasverifiedbadge');

  if (!userData) {
    return {
      status: 'Error',
      error: 'Your .ROBLOSECURITY cookie is invalid',
    };
  } else if (userData) {
    return {
      status: 'Success',
      userId,
      userName,
      displayName,
      isUnder13,
      createdDate,
      isPremiumUser,
      hasVerifiedBadge,
    };
  }
};
