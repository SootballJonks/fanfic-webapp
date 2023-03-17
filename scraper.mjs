import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const AO3_LOGIN_URL = 'https://archiveofourown.org/users/login';
const TARGET_URL = 'https://archiveofourown.org/works/40210590/chapters/100714395';

const USERNAME = process.env.AO3_USERNAME;
const PASSWORD = process.env.AO3_PASSWORD;

async function authenticate(page) {
  await page.goto(AO3_LOGIN_URL);

  await page.type('#user_login', USERNAME);
  await page.type('#user_password', PASSWORD);

  const loginButtonSelector = 'input[type="submit"][value="Log in"]';
  await page.waitForSelector(loginButtonSelector, { visible: true, timeout: 60000 });
  await Promise.all([
    page.waitForNavigation(),
    page.click(loginButtonSelector),
  ]);

  const currentPageUrl = page.url();
  if (currentPageUrl !== AO3_LOGIN_URL) {
    console.log('Authenticated successfully.');
  } else {
    console.error('Authentication failed. Please check your credentials.');
  }
}


async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await authenticate(page);
  await page.goto(TARGET_URL);

  const body = await page.content();
  const $ = cheerio.load(body);

  const rating = $('dd.rating').text().trim();
    const fandoms = $('dd.fandom a').map((_, el) => $(el).text()).get();
    const relationship = $('dd.relationship a').map((_, el) => $(el).text()).get();
    const character = $('dd.character a').map((_, el) => $(el).text()).get();
    const additionalTags = $('dd.freeform a').map((_, el) => $(el).text()).get();

    const published = $('dd.published').text().trim();
    const words = $('dd.words').text().trim();
    const chapters = $('dd.chapters').text().trim();

    const title = $('h2.title.heading').text().trim();
    const author = $('h3.byline a[rel="author"]').text().trim();
    const summary = $('blockquote.userstuff:first').text().trim();

    const data = {
      rating,
      fandoms,
      relationship,
      character,
      additionalTags,
      stats: {
        published,
        words,
        chapters,
      },
      title,
      author,
      summary,
    };

    console.log(data); //add return value once this starts working

  await browser.close();
}

scrape();
