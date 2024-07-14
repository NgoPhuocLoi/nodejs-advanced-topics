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
      { name: "session.sig", value: sessionSig },
    );

    await Promise.all([
      this.page.waitForSelector('a[href="/auth/logout"]'),
      this.page.goto(redirectUrl),
    ]);
  }

  async get(url) {
    return this.page.evaluate(
      (_url) =>
        fetch(_url, {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json()),
      url,
    );
  }

  async post(url, body) {
    return this.page.evaluate(
      (_url, _body) =>
        fetch(_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(_body),
        }).then((res) => res.json()),
      url,
      body,
    );
  }
}

module.exports = CustomPage;
