// captchaSolver.js
import fetch from 'node-fetch';

class CaptchaSolver {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  
  async solveRecaptcha(siteKey, url) {
    const apiUrl = `https://2captcha.com/in.php?key=${this.apiKey}&method=turnstile&sitekey=${siteKey}&pageurl=${url}&json=1`;

    const response = await fetch(apiUrl);
    const result = await response.json();
    console.log("Request received by 2captcha!");

    if (result.status !== 1) {
      return { errorId: 1, errorMessage: 'Error sending captcha to 2captcha' };
    }

    const requestId = result.request;

    for (let i = 0; i < 24; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const checkUrl = `https://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${requestId}&json=1`;
      const checkResponse = await fetch(checkUrl);
      const checkResult = await checkResponse.json();
      console.log("Checking request status...");

      if (checkResult.status === 1) {
        console.log("Checking request status... OK! ✔");
        return { errorId: 0, solution: checkResult.request };
      }
    }

    return { errorId: 1, errorMessage: 'Timeout solving captcha' };
  }

  // async solveCloudflareTurnstile(url) {
  //   const apiUrl = `https://2captcha.com/in.php?key=${this.apiKey}&method=cfstream&url=${encodeURIComponent(url)}&json=1`;

  //   const response = await fetch(apiUrl);
  //   const result = await response.json();
  //   console.log("result: ", result)

  //   if (result.status !== 1) {
  //     return { errorId: 1, errorMessage: 'Error sending Cloudflare Turnstile request to 2captcha' };
  //   }

  //   const requestId = result.request;

  //   for (let i = 0; i < 24; i++) {
  //     await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

  //     const checkUrl = `https://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${requestId}&json=1`;
  //     const checkResponse = await fetch(checkUrl);
  //     const checkResult = await checkResponse.json();

  //     if (checkResult.status === 1) {
  //       return { errorId: 0, solution: checkResult.request };
  //     }
  //   }

  //   return { errorId: 1, errorMessage: 'Timeout solving Cloudflare Turnstile' };
  // }
}



export default CaptchaSolver;
