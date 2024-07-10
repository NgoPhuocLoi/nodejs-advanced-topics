const mongoose = require("mongoose");
const User = mongoose.model("User");

const generateFakeSessionForUserWithId = (userId) => {
  const { Buffer } = require("buffer");
  const Keygrip = require("keygrip");
  const { cookieKey } = require("../config/keys");

  const bufferData = JSON.stringify({
    passport: {
      user: userId,
    },
  });

  const session = Buffer.from(bufferData).toString("base64");

  const keys = new Keygrip([cookieKey]);
  const sessionSig = keys.sign("session=" + session);

  return { session, sessionSig };
};

const generateUser = async () => {
  const newUser = await User.create({});
  return newUser;
};

module.exports = {
  generateFakeSessionForUserWithId,
  generateUser,
};
