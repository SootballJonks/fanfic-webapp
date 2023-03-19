import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import CaptchaSolver from './captchaSolver.mjs';
import dotenv from 'dotenv';
dotenv.config();

const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY; // Replace with your API key
const captchaSolver = new CaptchaSolver(RECAPTCHA_API_KEY);

puppeteer.use(StealthPlugin());

async function solveCaptcha(page) {
  try {
    // Wait for the reCAPTCHA element to be available before getting the siteKey
    console.log("Step 1: solveCaptcha function has been called...");
    // await page.waitForSelector('.g-recaptcha', { timeout: 10000 });

    const siteKey = await page.evaluate(() => {
      // return document.querySelector('.g-recaptcha')?.getAttribute('data-sitekey');
      return "0x4AAAAAAAAjq6WYeRDKmebM";
    });

    if (siteKey) {
      const url = page.url();
      const captchaResponse = await captchaSolver.solveRecaptcha(siteKey, url);
      console.log("Step 2: captchaResponse: ", captchaResponse);

      if (captchaResponse.errorId === 0) {
        await page.evaluate(
          (response) => {
            console.log("Step 3: Applying token and attempting to click checkbox...");
            document.querySelector('input[name="cf-turnstile-response"]').value = response;
          },
          captchaResponse.solution
        );
        await page.waitForTimeout(60000);
        // await page.click('.ctp-checkbox-container .mark');
        return true;
      }
    }
  } catch (error) {
    console.log('reCAPTCHA element not found or timed out:', error.message);
  }

  return false;
}


async function ffScrape() {
  // Set up Puppeteer browser
  const browser = await puppeteer.launch({ headless: false }); 
  const page = await browser.newPage();

  // Navigate to the URL
  const url = 'https://www.fanfiction.net/s/4918909/1/The-Still-Beat';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // Introduce a delay to allow the Cloudflare challenge page to load
  await page.waitForTimeout(30000); // delay to load captcha
  const captchaSolved = await solveCaptcha(page);
  await page.waitForTimeout(5000); // delay to submit captcha

  if (captchaSolved) {
    console.log('Captcha solved.');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
  } else {
    console.log('Captcha not detected or not solved.');
  }

  // Collect text from the 'profile_top' element
  const profileTopSelector = '#profile_top';
  const profileTop = await page.$eval(profileTopSelector, el => el.textContent.trim());

  // Collect text from the 'pre_story_links' element
  const preStoryLinksSelector = '#pre_story_links';
  const preStoryLinks = await page.$eval(preStoryLinksSelector, el => el.textContent.trim());

  // Log the results
  console.log('Profile Top:', profileTop);
  console.log('Pre Story Links:', preStoryLinks);

  // Close the browser
  await browser.close();
}

// Run the scraper
ffScrape();
