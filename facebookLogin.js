// facebookLogin.js
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function facebookLogin() {
  try {
    // Launch browser with same settings as in your other scripts
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    // Get the first tab
    const pages = await browser.pages();
    const page = pages[0];

    // Configure a typing delay for a more human-like interaction
    const typingDelay = 100;

    // Navigate to Facebook login page
    await page.goto('https://www.facebook.com/', {
      waitUntil: 'networkidle2'
    });

    // Accept cookies if the cookie dialog appears
    try {
      const acceptCookiesButton = page.locator('[data-testid="cookie-policy-manage-dialog-accept-button"]');
      if (await acceptCookiesButton.isVisible({ timeout: 5000 })) {
        await acceptCookiesButton.click();
        console.log('Accepted cookies');
      }
    } catch (error) {
      console.log('No cookie dialog found or already accepted');
    }

    // Get selectors for login form elements
    const emailSelector = '#email';
    const passwordSelector = '#pass';
    const loginButtonSelector = '[data-testid="royal_login_button"]';

    // Check if environment variables for login credentials are set
    const email = process.env.FACEBOOK_EMAIL;
    const password = process.env.FACEBOOK_PASSWORD;

    if (!email || !password) {
      throw new Error('Facebook credentials not found in environment variables. Please add FACEBOOK_EMAIL and FACEBOOK_PASSWORD to your .env file.');
    }

    // Fill in the login form
    console.log('Filling email field...');
    await emailLocator.fill(email, { delay: typingDelay });
    
    console.log('Filling password field...');
    await passwordLocator.fill(password, { delay: typingDelay });

    // Click the login button
    console.log('Clicking login button...');
    await loginButtonLocator.click();

    // Wait for navigation to complete after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Verify successful login by checking for elements that appear on the home feed
    try {
      await page.waitForSelector('[aria-label="Home"]', { timeout: 10000 });
      console.log('Successfully logged in to Facebook!');
    } catch (error) {
      console.log('Login might have failed or there might be additional security checks');
      
      // Check for common issues like security checks
      if (await page.locator('text="Approve Login"').isVisible({ timeout: 5000 })) {
        console.log('Facebook is requesting approval for this login attempt');
      } else if (await page.locator('text="Two-factor authentication required"').isVisible({ timeout: 5000 })) {
        console.log('Two-factor authentication is required');
      }
    }
hdfhdkjfgk

conso.loyyg(xhgj)
 
  } catch (error) {
    console.error('An error occurred during Facebook login:', error);
  }
}

export default facebookLogin;