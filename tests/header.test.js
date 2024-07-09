const puppeteer = require("puppeteer");
const { generateFakeSessionForUserWithId } = require("./helpers");

// Setup

let browser, page;

beforeAll(() => {
  require("dotenv").config();
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    product: "firefox",
    protocol: "webDriverBiDi",
    // headless: false,
  });
  page = await browser.newPage();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

// ---

test("Should start a browser and access localhost:3000", async () => {
  const headerText = await page.$eval("a.brand-logo", (el) => el.innerText);

  expect(headerText).toEqual("Blogster");
});

test("Shoud start the OAuth flow by clicking the Login button", async () => {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.click("ul.right a"),
  ]);
  const url = page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test("Shoud see the Logout button after login", async () => {
  const userId = "6682aef322f3b678aa9d6f20";

  const { session, sessionSig } = generateFakeSessionForUserWithId(userId);

  await page.setCookie(
    { name: "session", value: session },
    { name: "session.sig", value: sessionSig }
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.reload(),
  ]);

  const logoutButtonText = await page.$$eval(
    "ul.right li",
    (els) => els[1].innerText
  );

  expect(logoutButtonText).toEqual("Logout");
});
