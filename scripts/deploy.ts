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
  const s3 = new S3Client({ region });
  const cloudfront = new CloudFrontClient({ region });
  const bucket = process.env.S3_BUCKET;
  const distributionId = process.env.CLOUDFRONT_ID;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const distRoot = resolve(__dirname, "../dist");

  for (const screen of screens) {
    const screenPath = resolve(distRoot, screen);

    // Upload all JS and CSS in the screen folder
    const files = readdirSync(screenPath).filter(
      (f) => f.endsWith(".js") || f.endsWith(".css")
    );

    for (const file of files) {
      const content = readFileSync(join(screenPath, file));
      const contentType = file.endsWith(".js")
        ? "application/javascript"
        : "text/css";

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${screen}/${file}`,
          Body: content,
          ContentType: contentType,
          CacheControl: "max-age=31536000",
        })
      );

      console.log(`✅ Uploaded ${screen}/${file}`);
    }
  }

  // Invalidate CloudFront cache
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
