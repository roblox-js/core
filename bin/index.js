#!/usr/bin/env node

const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");
const fs2 = require("fs").promises;
const { exec, execSync } = require("child_process");
const { setTimeout } = require("node:timers/promises");
const chalk = require("chalk");
const path = require("path");
const ora = require("ora-classic");
const { prompt, Select, Confirm } = require("enquirer");

// Get the project root directory
const projectDir = process.cwd();
// Define paths for cookies and QR codes
const COOKIE_PATH = path.join(projectDir, "auth.json");
const QR_TEMP_DIR = path.join(projectDir, "node_modules", "roflare", "bin");

// Ensure temp directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
    }
  }
}

async function login() {
  let browser;
  try {
    // Ensure temp directory exists for QR codes
    ensureDirExists(QR_TEMP_DIR);

    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.goto("https://www.roblox.com/login");

    // Wait for the QR code login button and click it
    const buttonSelector = "#cross-device-login-button";
    await page.waitForSelector(buttonSelector, { timeout: 5000 });
    await page.click(buttonSelector);

    try {
      let loginDetails = {
        qr: null,
        code: null,
      };

      // Wait for the QR code image to appear in the DOM
      const qrImage = await page.waitForSelector(
        ".cross-device-login-display-qr-code-image",
        { visible: true }
      );

      // Retrieve the source of the QR code image
      loginDetails.qr = await page.evaluate((img) => img.src, qrImage);

      const urlObj = new URL(loginDetails.qr);
      const params = new URLSearchParams(urlObj.search);
      loginDetails.code = params.get("code");

      const savePath = path.join(QR_TEMP_DIR, `qr-code-${Date.now()}.jpeg`);

      async function downloadImage(url, savePath) {
        try {
          // Send GET request to the image URL
          const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
          });

          // Create a write stream to save the image
          const writer = fs.createWriteStream(savePath);

          // Pipe the response data to the write stream
          response.data.pipe(writer);

          // Return a Promise that resolves when the file has been saved
          return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
        } catch (error) {
          // Silent error handling
        }
      }

      // Download and save the QR code image
      await downloadImage(loginDetails.qr, savePath);

      console.clear();

      console.log(
        chalk.yellow(
          "This function requires authentication, please login using one of the methods below.\n"
        )
      );

      // Using enquirer's Select instead of inquirer
      const response = await prompt({
        type: "select",
        name: "loginOption",
        message: "Please select an option:",
        choices: [
          { name: "qrCode", message: "(1) QR Code (Recommended, Requires Mobile Device)" },
          { name: "quickSignIn", message: "(2) Quick Sign In" },
          { name: "exit", message: "(3) Exit" }
        ]
      });

      function copyToClipboard(text) {
        execSync(`echo ${text} | clip`);
      }

      function openFile(filePath) {
        const fullPath = path.resolve(filePath);

        let command;
        if (process.platform === "win32") {
          // Windows
          command = `start ${fullPath}`;
        } else if (process.platform === "darwin") {
          // macOS
          command = `open ${fullPath}`;
        } else if (process.platform === "linux") {
          // Linux
          command = `xdg-open ${fullPath}`;
        }

        exec(command, (err) => {
          // Silent error handling
        });
      }

      // Process the user's choice
      switch (response.loginOption) {
        case "qrCode":
          openFile(savePath);
          console.log(
            chalk.blue(`
You have selected the QR Code authentication method.

The QR Code should have opened automatically. If it did not, please access it using the following path:

${chalk.bold.green(savePath)}

Once you scan the QR Code, you will be authenticated. Please do not close the console.
`)
          );
          break;
        case "quickSignIn":
          console.log(
            chalk.cyan(`
You selected Quick Sign In.
            
If on web, please navigate to:
            
${chalk.bold.yellow("https://www.roblox.com/crossdevicelogin/ConfirmCode")}
and enter ${chalk.bold.magenta(loginDetails.code)}
            
If on mobile, please open your Roblox app and go to:
            
${chalk.bold.green("More Page > Quick Sign In")}
and enter ${chalk.bold.magenta(loginDetails.code)}

Once you enter the code, you will be authenticated. Please do not close the console.
            `)
          );
          copyToClipboard(loginDetails.code);
          break;
        case "exit":
          console.log("Exiting...");
          process.exit();
          break;
      }
    } catch (error) {
      console.error("Error retrieving QR code:", error);
    }

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      if (
        request.method() === "GET" &&
        request.url() === "https://www.roblox.com/home"
      ) {
        // Get all cookies from .roblox.com domain
        await setTimeout(1000);
        const cookies = await browser.cookies();

        // Save cookies to JSON file in project root as auth.json
        fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));

        console.log(chalk.bold.yellowBright("Successfully authenticated!\n"));
        console.log(
          chalk.bold.bgYellow(
            "\nAuthentication data saved to auth.json in project directory"
          )
        );
        console.log(
            chalk.bold.red(
              "Keep this file secure, as it contains sensitive information that could grant access to your account."
            )
          );

        await browser.close();
      }
      request.continue();
    });
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
}

async function checkAuthStatus() {
  try {
    // Check if auth.json exists in the project directory
    if (!fs.existsSync(COOKIE_PATH)) {
      return { status: 2 }; // Not authenticated
    }

    // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const cookiesString = await fs2.readFile(COOKIE_PATH, "utf-8");
      const cookies = JSON.parse(cookiesString);

      // Set cookies in the browser
      await page.setCookie(...cookies);

      // Navigate to Roblox home page
      await page.goto("https://www.roblox.com/home");

      try {
        await page.waitForSelector("#nav-profile", { timeout: 5000 });

        const data = await page.evaluate(() => {
          const metaTag = document.querySelector('meta[name="user-data"]');
          if (!metaTag) return null;

          return {
            userId: metaTag.getAttribute("data-userid"),
            name: metaTag.getAttribute("data-name"),
            displayName: metaTag.getAttribute("data-displayname"),
            isUnder13: metaTag.getAttribute("data-isunder13") === "true",
            created: metaTag.getAttribute("data-created"),
            isPremiumUser: metaTag.getAttribute("data-ispremiumuser") === "true",
            hasVerifiedBadge:
              metaTag.getAttribute("data-hasverifiedbadge") === "true",
          };
        });
        await browser.close();
        return {
          status: 1,
          data: data,
        };
      } catch (error) {
        await browser.close();
        return {
          status: 2,
        };
      }
    } catch (error) {
      await browser.close();
      return { status: 2 };
    }
  } catch (error) {
    console.error("Error in checkAuthStatus:", error);
    return { status: 2 };
  }
}

async function main() {
  try {
    // Start login process
    const spinner = ora("Checking authentication status").start();

    const auth = await checkAuthStatus();
    if (auth.status === 1) {
      spinner.stop();
      let userData = auth.data;
      console.log(chalk.green("You are authenticated!"));
      console.log(
        `\nName: ${userData.displayName} ${chalk.grey(
          `(@${userData.name})`
        )}\nId: ${userData.userId}\n`
      );

      // Using enquirer's Select instead of inquirer
      const answer = await (new Select({
        name: "action",
        message: "What would you like to do?",
        choices: ["Log Out", "Export Cookies", "Exit"]
      })).run();

      if (answer === "Log Out") {
        // Delete auth.json file
        if (fs.existsSync(COOKIE_PATH)) {
          try {
            fs.unlinkSync(COOKIE_PATH);
            console.log(chalk.yellow("Successfully logged out."));
          } catch (error) {
            console.error(`Error deleting auth file: ${error}`);
          }
        }
      } else if (answer === "Export Cookies") {
        // Open the auth.json file
        if (fs.existsSync(COOKIE_PATH)) {
          openFile(COOKIE_PATH);
        } else {
          console.log(chalk.red("Auth file not found."));
        }
      } else if (answer === 'Exit') {
        process.exit();
      }
    } else if (auth.status === 2) {
      spinner.stop();

      console.log("You are unauthenticated.");

      // Using enquirer's Confirm instead of inquirer
      const response = await (new Confirm({
        name: 'login',
        message: 'Would you like to login now?'
      })).run();

      if (response) {
        console.clear();
        login();
      } else {
        process.exit();
      }
    }
  } catch (error) {
    console.error("Main process error:", error.message);
  }
}

// Helper function to open files
function openFile(filePath) {
  const fullPath = path.resolve(filePath);

  let command;
  if (process.platform === "win32") {
    command = `start ${fullPath}`;
  } else if (process.platform === "darwin") {
    command = `open ${fullPath}`;
  } else if (process.platform === "linux") {
    command = `xdg-open ${fullPath}`;
  }

  exec(command, (err) => {
    // Silent error handling
  });
}

// Run the authentication flow
main();