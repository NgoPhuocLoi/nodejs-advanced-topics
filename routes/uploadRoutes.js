const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const keys = require("../config/keys");
const { v4: uuidv4 } = require("uuid");
const requireLogin = require("../middlewares/requireLogin");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: keys.s3AccessKeyId,
    secretAccessKey: keys.s3SecretAccessKey,
  },
});

module.exports = (app) => {
  app.get("/api/upload", requireLogin, async (req, res) => {
    const key = `${req.user.id}/${uuidv4()}.jpeg`;
    const command = new PutObjectCommand({
      Bucket: "advanced-nodejs-topic-blogs",
      Key: key,
      ContentType: "image/jpeg",
    });
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      res.json({ key, url });
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });
};
