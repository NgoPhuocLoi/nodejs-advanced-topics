const Page = require("./customPage");
const { apiService } = require("./helpers");

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in and click create new blog button", () => {
  beforeEach(async () => {
    await page.login({
      redirectUrl: "http://localhost:3000/blogs",
    });

    await page.click('a[href="/blogs/new"]');
  });

  test("Should see the create new blog form", async () => {
    const firstLabelText = await page.$eval("form label", (el) => el.innerText);

    expect(firstLabelText).toMatch("Blog Title");
  });

  test("Should show errors when input fields are invalid", async () => {
    await page.click('button[type="submit"]');

    const titleErrorText = await page.$eval(
      ".title .red-text",
      (el) => el.innerText,
    );
    const contentErrorText = await page.$eval(
      ".content .red-text",
      (el) => el.innerText,
    );

    expect(titleErrorText).toEqual("You must provide a value");
    expect(contentErrorText).toEqual("You must provide a value");
  });

  describe("Provide valid values", () => {
    beforeEach(async () => {
      await page.type(".title input", "Valid title");
      await page.type(".content input", "Valid content");
      await page.click('button[type="submit"]');
    });

    test("Should see the confirmation page", async () => {
      const pageTitle = await page.$eval("form h5", (el) => el.innerText);
      expect(pageTitle).toEqual("Please confirm your entries");
    });

    test("Should successfully create new blog", async () => {
      await Promise.all([
        page.waitForSelector(".card"),
        page.click("button.green"),
      ]);

      expect(page.url()).toEqual("http://localhost:3000/blogs");
    });
  });
});

describe("When user is not authenticated", () => {
  test("Should not be able to create a blog", async () => {
    const result = await page.post("/api/blogs", {
      title: "Five",
      content: "Five",
    });

    expect(result.error).toEqual("You must log in!");
  });

  test("Should not be able to see the blogs", async () => {
    const result = await page.get("/api/blogs");

    expect(result.error).toEqual("You must log in!");
  });
});
