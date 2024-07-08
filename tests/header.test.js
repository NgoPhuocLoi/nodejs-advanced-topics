const puppeteer = require("puppeteer");

test("Adding two number", () => {
  const result = 1 + 2;

  expect(result).toEqual(3);
});

test("Should start a browser", async () => {
  const browser = await puppeteer.launch({
    product: "firefox",
    protocol: "webDriverBiDi",
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000");

  const headerText = await page.$eval("a.brand-logo", (el) => el.innerText);

  expect(headerText).toEqual("Blogster");

  await browser.close();
});
