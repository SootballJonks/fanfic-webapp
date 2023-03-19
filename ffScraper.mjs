import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import CaptchaSolver from './captchaSolver.mjs';
// import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
// import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';
import dotenv from 'dotenv';
dotenv.config();

const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY; // Replace with your API key
const captchaSolver = new CaptchaSolver(RECAPTCHA_API_KEY);

puppeteer.use(StealthPlugin());
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: RECAPTCHA_API_KEY,
//     },
//     visualFeedback: true,
//   }),
// );
// puppeteer.use(UserPreferencesPlugin({
//   userPrefs: {
//     credential_enable_service: false,
//     profile: {
//       password_manager_enabled: false,
//     },
//   },
// }));

async function solveCaptcha(page) {
  try {
    // Wait for the reCAPTCHA element to be available before getting the siteKey
    await page.waitForSelector('.g-recaptcha', { timeout: 10000 });

    const siteKey = await page.evaluate(() => {
      return document.querySelector('.g-recaptcha')?.getAttribute('data-sitekey');
    });

    if (siteKey) {
      const url = page.url();
      const captchaResponse = await captchaSolver.solveRecaptcha(siteKey, url);

      if (captchaResponse.errorId === 0) {
        await page.evaluate(
          (response) => {
            document.getElementById('g-recaptcha-response').innerHTML = response;
          },
          captchaResponse.solution
        );
        await page.click('#challenge-form button');
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

  // // CLOUDFLARE CAPTCHA BYPASS
  // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
  // await page.setViewport({ width: 1280, height: 800 });


  // Navigate to the URL
  const url = 'https://www.fanfiction.net/s/4918909/1/The-Still-Beat';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // Introduce a delay to allow the Cloudflare challenge page to load
  await page.waitForTimeout(5000); // delay to load captcha
  const captchaSolved = await solveCaptcha(page);
  await page.waitForTimeout(5000); // delay to submit captcha

  if (captchaSolved) {
    console.log('Captcha solved.');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
  } else {
    console.log('Captcha not detected or not solved.');
  }


  // //Check for Cloudflare challenge page
  // const cloudflareChallengeSelector = '#challenge-form';
  // const hasCloudflareChallenge = await page.$(cloudflareChallengeSelector);
  // if (hasCloudflareChallenge) {
  //   console.log('Cloudflare challenge detected, solving reCAPTCHA...');
  //   await page.solveRecaptchas();
  //   console.log('Cloudflare challenge solved.');
  //   // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
  // }

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
