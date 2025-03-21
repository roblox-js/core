#!/usr/bin/env node

const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { setTimeout } = require('node:timers/promises');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora-classic');
const os = require('os')
const { prompt, Select, Confirm } = require('enquirer');

// Project root directory
const projectDir = process.cwd();
const COOKIE_PATH = path.join(projectDir, 'auth.json');
const QR_TEMP_DIR = os.tmpdir();

// Ensure directory exists (async)
async function ensureDirExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`Error creating directory ${dirPath}:`, error.message);
    }
  }
}

// Check if we're on a server (no GUI)
const isServer = !process.env.DISPLAY && process.platform !== 'win32';

async function login() {
  let browser;
  try {
    await ensureDirExists(QR_TEMP_DIR);

    // Optimized Puppeteer launch for low-performance systems
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode for better performance
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'], // Server-friendly
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Allow custom Chromium
      defaultViewport: { width: 1024, height: 768 }, // Smaller viewport
    });

    const page = await browser.newPage();
    await page.goto('https://www.roblox.com/login', { waitUntil: 'domcontentloaded' });

    // Click QR login button with timeout
    const buttonSelector = '#cross-device-login-button';
    await page.waitForSelector(buttonSelector, { timeout: 10000 });
    await page.click(buttonSelector);

    let loginDetails = { qr: null, code: null };

    // Wait for QR code with fallback
    try {
      const qrImage = await page.waitForSelector('.cross-device-login-display-qr-code-image', {
        visible: true,
        timeout: 10000,
      });
      loginDetails.qr = await page.evaluate((img) => img.src, qrImage);
      const urlObj = new URL(loginDetails.qr);
      loginDetails.code = urlObj.searchParams.get('code');
    } catch (error) {
      console.error('QR code not found, falling back to code only:', error.message);
    }

    const savePath = loginDetails.qr ? path.join(QR_TEMP_DIR, `qr-code-${Date.now()}.jpeg`) : null;
    async function downloadImage(url, savePath) {
      try {
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          timeout: 10000, // Add timeout
        });
        await new Promise((resolve, reject) => {
          const writer = require('fs').createWriteStream(savePath);
          response.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        return savePath;
      } catch (error) {
        console.warn('Failed to download QR image:', error.message);
        return null;
      }
    }

    if (loginDetails.qr && !isServer) {
      await downloadImage(loginDetails.qr, savePath);
    }

    console.clear();
    console.log(chalk.yellow('Authentication required. Choose a login method:\n'));

    const response = await prompt({
      type: 'select',
      name: 'loginOption',
      message: 'Please select an option:',
      choices: [
        { name: 'qrCode', message: '(1) QR Code (Recommended, Requires Mobile Device)' },
        { name: 'quickSignIn', message: '(2) Quick Sign In' },
        { name: 'exit', message: '(3) Exit' },
      ],
    });

    function copyToClipboard(text) {
      try {
        exec(`echo "${text}" | pbcopy || echo "${text}" | xclip || echo "${text}" | clip`, (err) => {
          if (err) console.warn('Clipboard copy failed:', err.message);
        });
      } catch (error) {
        console.warn('Clipboard unavailable:', error.message);
      }
    }

    function openFile(filePath) {
      if (isServer) {
        console.log(chalk.gray(`File available at: ${filePath}`));
        return;
      }
      const command =
        process.platform === 'win32'
          ? `start ${filePath}`
          : process.platform === 'darwin'
          ? `open ${filePath}`
          : `xdg-open ${filePath}`;
      exec(command, (err) => {
        if (err) console.warn('Failed to open file:', err.message);
      });
    }

    switch (response.loginOption) {
      case 'qrCode':
        if (savePath && !isServer) {
          openFile(savePath);
          console.log(
            chalk.blue(`
QR Code saved at: ${chalk.bold.green(savePath)}
Scan it with your Roblox mobile app. Do not close this console.
          `),
          );
        } else {
          console.log(
            chalk.blue(`
QR Code URL: ${chalk.bold.green(loginDetails.qr || 'Not available')}
Use this URL or the code below on your mobile device.
          `),
          );
        }
        break;
      case 'quickSignIn':
        console.log(
          chalk.cyan(`
Quick Sign In Code: ${chalk.bold.magenta(loginDetails.code || 'Not available')}

Web: https://www.roblox.com/crossdevicelogin/ConfirmCode
Mobile: More Page > Quick Sign In

Enter the code to authenticate. Do not close this console.
        `),
        );
        if (loginDetails.code) copyToClipboard(loginDetails.code);
        break;
      case 'exit':
        console.log('Exiting...');
        await browser.close();
        process.exit();
    }

    let csrfToken;

    await page.setRequestInterception(true);

    page.on('request', async (request) => {
      if (request.method() === 'POST') {
        const headers = request.headers();
        // Check for X-CSRF-Token in headers
        if (headers['x-csrf-token']) {
          csrfToken = headers['x-csrf-token'];
        }
      }
      if (request.url() === 'https://www.roblox.com/home') {
        await setTimeout(1000);
        const cookies = await page.cookies();
        const data = {
          cookies,
          csrfToken,
        };
        await fs.writeFile(COOKIE_PATH, JSON.stringify(data, null, 2));
        console.log(chalk.bold.yellowBright('Successfully authenticated!\n'));
        console.log(chalk.bold.bgYellow('\nSaved to auth.json'));
        console.log(chalk.bold.red('Keep auth.json secure.'));

        // Delete the QR code file if it exists
        if (savePath) {
          try {
            await fs.unlink(savePath);
          } catch (error) {
          }
        }
        await browser.close();
      }
      request.continue();
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (browser) await browser.close();
  }
}

async function checkAuthStatus() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Read the auth.json file
    const authString = await fs.readFile(COOKIE_PATH, 'utf-8').catch(() => null);
    if (!authString) return { status: 2 };

    // Parse the JSON and extract the cookies array
    const authData = JSON.parse(authString);
    const cookies = authData.cookies;

    // Set cookies in the browser
    await page.setCookie(...cookies);
    await page.goto('https://www.roblox.com/home', { waitUntil: 'domcontentloaded' });

    try {
      await page.waitForSelector('#nav-profile', { timeout: 5000 });
      const data = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="user-data"]');
        return metaTag
          ? {
              userId: metaTag.getAttribute('data-userid'),
              name: metaTag.getAttribute('data-name'),
              displayName: metaTag.getAttribute('data-displayname'),
            }
          : null;
      });
      await browser.close();
      return { status: 1, data };
    } catch {
      await browser.close();
      return { status: 2 };
    }
  } catch (error) {
    console.error('Auth check error:', error.message);
    if (browser) await browser.close();
    return { status: 2 };
  }
}

async function main() {
  try {
    const spinner = ora('Checking authentication status').start();
    const auth = await checkAuthStatus();
    spinner.stop();

    if (auth.status === 1) {
      console.log(chalk.green('You are authenticated!'));
      console.log(`\nName: ${auth.data.displayName} (@${auth.data.name})\nId: ${auth.data.userId}\n`);

      const answer = await new Select({
        name: 'action',
        message: 'What would you like to do?',
        choices: ['Log Out', 'Export Cookies', 'Exit'],
      }).run();

      if (answer === 'Log Out') {
        await fs.unlink(COOKIE_PATH).catch((err) => console.error('Logout error:', err.message));
        console.log(chalk.yellow('Logged out.'));
      } else if (answer === 'Export Cookies') {
        if (!isServer) openFile(COOKIE_PATH);
        else console.log(chalk.gray(`Cookies at: ${COOKIE_PATH}`));
      } else {
        process.exit();
      }
    } else {
      console.log('You are unauthenticated.');
      const response = await new Confirm({ name: 'login', message: 'Login now?' }).run();
      if (response) {
        console.clear();
        await login();
      } else {
        process.exit();
      }
    }
  } catch (error) {
    console.error('Main error:', error.message);
  }
}

function openFile(filePath) {
  if (isServer) {
    console.log(chalk.gray(`File available at: ${filePath}`));
    return;
  }
  const command =
    process.platform === 'win32'
      ? `start ${filePath}`
      : process.platform === 'darwin'
      ? `open ${filePath}`
      : `xdg-open ${filePath}`;
  exec(command, (err) => {
    if (err) console.warn('Failed to open file:', err.message);
  });
}

main();
