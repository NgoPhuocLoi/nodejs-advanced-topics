const puppeteer = require("puppeteer");
const { generateFakeSessionForUserWithId, generateUser } = require("./helpers");

// Setup

let browser, page;

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
}, 10000);

test("Shoud start the OAuth flow by clicking the Login button", async () => {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.click("ul.right a"),
  ]);
  const url = page.url();

  expect(url).toMatch(/accounts\.google\.com/);
}, 10000);

test("Shoud see the Logout button after login", async () => {
  const newUser = await generateUser();
  const userId = newUser._id.toString();

  const { session, sessionSig } = generateFakeSessionForUserWithId(userId);

  await page.setCookie(
    { name: "session", value: session },
    { name: "session.sig", value: sessionSig }
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.reload(),
  ]);

  const logoutButtonText = await page.$$eval("ul.right li", (els) => {
    console.log({ els });
    return els[1].innerText;
  });

  expect(logoutButtonText).toEqual("Logout");
}, 10000);
