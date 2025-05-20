import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";

dotenv.config();

// Screen definitions (keep in sync with vite.config.ts)
const screens = ["login-id", "login-password"];

async function deploy() {
  const region = "eu-north-1";
  const s3 = new S3Client({ region: region });
  const cloudfront = new CloudFrontClient({ region: region });
  const bucket = process.env.S3_BUCKET;
  const distributionId = process.env.CLOUDFRONT_ID;

  for (const screen of screens) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const distPath = resolve(__dirname, `../dist/${screen}`);
    const assetsPath = resolve(__dirname, `../dist/assets`);

    // Upload screen-specific assets
    const screenFiles = readdirSync(distPath).filter(
      (file) => file.endsWith(".js") || file.endsWith(".css")
    );

    for (const file of screenFiles) {
      try {
        const content = readFileSync(join(distPath, file));
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
        console.log(`Uploaded ${screen}/${file}`);
      } catch (err) {
        console.warn(`Skipping ${file} for ${screen}: ${err.message}`);
      }
    }

    // Upload shared vendor assets
    const vendorFiles = readdirSync(assetsPath).filter((file) =>
      file.startsWith("vendor-")
    );

    for (const file of vendorFiles) {
      try {
        const content = readFileSync(join(assetsPath, file));
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: `${screen}/${file}`, // upload vendor chunks per screen
            Body: content,
            ContentType: "application/javascript",
            CacheControl: "max-age=31536000",
          })
        );
        console.log(`Uploaded ${screen}/${file} (vendor)`);
      } catch (err) {
        console.warn(
          `Skipping vendor file ${file} for ${screen}: ${err.message}`
        );
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
