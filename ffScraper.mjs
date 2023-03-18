import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
// import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';
import dotenv from 'dotenv';
dotenv.config();

const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY; // Replace with your API key

puppeteer.use(StealthPlugin());
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: RECAPTCHA_API_KEY,
    },
    visualFeedback: true,
  }),
);
// puppeteer.use(UserPreferencesPlugin({
//   userPrefs: {
//     credential_enable_service: false,
//     profile: {
//       password_manager_enabled: false,
//     },
//   },
// }));

async function ffScrape() {
  // Set up Puppeteer browser
  const browser = await puppeteer.launch({ headless: false }); // Change to headless: true when done debugging
  const page = await browser.newPage();

  // // CLOUDFLARE CAPTCHA BYPASS
  // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
  // await page.setViewport({ width: 1280, height: 800 });


  // Navigate to the URL
  const url = 'https://www.fanfiction.net/s/4918909/1/The-Still-Beat';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // Introduce a delay to allow the Cloudflare challenge page to load
  await page.waitForTimeout(10000); // 5000 == 5 seconds delay

  await page.solveRecaptchas();
  // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });


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
