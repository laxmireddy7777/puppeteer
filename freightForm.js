import puppeteer from 'puppeteer';
import { faker } from '@faker-js/faker';
import { MailSlurp } from 'mailslurp-client';

import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.MAILSLURP_API_KEY;
const mailslurp = new MailSlurp({ apiKey });

async function freightForm() {
  try {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
    const pages = await browser.pages();
    const page = pages[0];

    const typingDelay = 100;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const accountName = faker.internet.username({ firstName, lastName });
    const accountCode = faker.internet.password(8);

    // Generate a secure password with special chars
    const password = faker.internet.password({
      length: 12,
      memorable: false,
      pattern: /[A-Za-z0-9!@#$%^&*()_+]/,
    });
    console.log(password, " password");

    // Create MailSlurp inbox
    const inbox = await mailslurp.createInbox();
    const email = inbox.emailAddress;
    console.log(email, " inbox email");

    await page.goto('https://cloud.voltuswave.com/signup?entryPoint=b72ad899-b46c-11ef-b3e4-069a269eab55', {
      waitUntil: 'networkidle2'
    });

    // Using Locator for form fields
    const firstNameLocator = page.locator('#firstName');
    const lastNameLocator = page.locator('#lastName');
    const emailLocator = page.locator('#enterEmail');
    const accountNameLocator = page.locator('#enterAccountName');
    const accountCodeLocator = page.locator('#enterAccountCode');
    const passwordLocator = page.locator('#password');
    const confirmPasswordLocator = page.locator('#confirmPassword');
    const submitButtonLocator = page.locator('button[type="submit"]');

    // Fill the form using Locators
    await firstNameLocator.fill(firstName);
    await new Promise(r => setTimeout(r, 1000));
    await lastNameLocator.fill(lastName);
    await new Promise(r => setTimeout(r, 1000));
    await emailLocator.fill(email);
    await new Promise(r => setTimeout(r, 1000));
    await accountNameLocator.fill(accountName);
    await new Promise(r => setTimeout(r, 1000));
    await accountCodeLocator.fill(accountCode);
    await new Promise(r => setTimeout(r, 1000));
    await passwordLocator.fill(password);
    await new Promise(r => setTimeout(r, 1000));
    await confirmPasswordLocator.fill(password);
    await new Promise(r => setTimeout(r, 1000));

    await submitButtonLocator.click();

    // Wait for OTP page to appear
    await page.waitForSelector('.css-1bfnh22-otpInputStyle');

    // Wait for OTP email
    console.log("Waiting for OTP email to arrive...");
    const emailResponse = await mailslurp.waitForLatestEmail(inbox.id, 60000); // 60s timeout

    const otpCode = emailResponse.body.match(/\d{6}/)?.[0];

    if (!otpCode) {
      console.error("Failed to extract OTP from email.");
      await browser.close();
      return;
    }

    console.log("Received OTP:", otpCode);

    // Using Locator for OTP inputs
    const otpInputs = page.locator('.css-1bfnh22-otpInputStyle');
    for (let i = 0; i < otpCode.length; i++) {
      await otpInputs.locator(`nth-child(${i + 1})`).fill(otpCode[i], { delay: 100 });
    }

    // Submit OTP
    await submitButtonLocator.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Wait for sign-in form to appear
    await page.waitForSelector('#loginEmail');
    await page.waitForSelector('#loginPassword');

    // Using Locator to fill in Sign In form
    const loginEmailLocator = page.locator('#loginEmail');
    const loginPasswordLocator = page.locator('#loginPassword');

    await loginEmailLocator.fill(email, { delay: typingDelay });
    await loginPasswordLocator.fill(password, { delay: typingDelay });

    // Click "Sign In" button
    await submitButtonLocator.click();

   console.log("Test Complete");

    // You can close the browser if needed
    // await browser.close();
  } catch (error) {
    console.log(error);
  }
}

export default freightForm;