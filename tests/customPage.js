const puppeteer = require("puppeteer");
const { generateUser, generateFakeSessionForUserWithId } = require("./helpers");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      product: "firefox",
      protocol: "webDriverBiDi",
      //   headless: false,
    });

    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: (target, property, receiver) => {
        if (target[property]) {
          return target[property];
        }

        let value = browser[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? browser : this, args);
          };
        }

        value = page[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? page : this, args);
          };
        }

        return value;
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login(options) {
    const newUser = await generateUser();
    const userId = newUser._id.toString();
    const redirectUrl = options?.redirectUrl || "http://localhost:3000";

    const { session, sessionSig } = generateFakeSessionForUserWithId(userId);

    await this.page.setCookie(
      { name: "session", value: session },
      { name: "session.sig", value: sessionSig }
    );

    await Promise.all([
      this.page.waitForSelector('a[href="/auth/logout"]'),
      this.page.goto(redirectUrl),
    ]);
  }
}

module.exports = CustomPage;
