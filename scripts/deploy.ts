import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { readFileSync } from "fs";
import { resolve } from "path";

// Screen definitions (keep in sync with vite.config.ts)
const screens = ["login-id", "login-password"];

async function deploy() {
  const region = "eu-north-1";
  const s3 = new S3Client({ region: region });
  const cloudfront = new CloudFrontClient({ region: region });
  const bucket = process.env.S3_BUCKET;
  const distributionId = process.env.CLOUDFRONT_ID;

  for (const screen of screens) {
    const distPath = resolve(__dirname, `../dist/${screen}`);

    // Upload assets
    const files = [
      "index.js",
      "index.css",
      "vendor-react.js",
      "vendor-auth0.js",
    ];
    for (const file of files) {
      try {
        const content = readFileSync(`${distPath}/${file}`);
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: `${screen}/${file}`,
            Body: content,
            ContentType: file.endsWith(".js")
              ? "application/javascript"
              : "text/css",
            CacheControl: "max-age=31536000",
          })
        );
      } catch (err) {
        console.warn(`Skipping ${file} for ${screen}: ${err.message}`);
      }
    }
  }

  // Invalidate cache
  await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    })
  );
}

deploy().catch(console.error);
