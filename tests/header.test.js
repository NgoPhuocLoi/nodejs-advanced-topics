const puppeteer = require("puppeteer");
const { generateFakeSessionForUserWithId, generateUser } = require("./helpers");
const Page = require("./customPage");
// Setup

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
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
  await page.login();

  const logoutButtonText = await page.$$eval("ul.right li", (els) => {
    console.log({ els });
    return els[1].innerText;
  });

  expect(logoutButtonText).toEqual("Logout");
});
