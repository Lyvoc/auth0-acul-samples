import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screens = ["login-id", "login-password", "mfa"];

async function deploy() {
  const s3 = new S3Client({ region: "us-east-1" });
  const cloudfront = new CloudFrontClient({ region: "us-east-1" });

  const bucket = process.env.S3_BUCKET;
  const distributionId = process.env.CLOUDFRONT_ID;

  for (const screen of screens) {
    const distPath = resolve(__dirname, `../dist/${screen}`);

    // Upload index.js and index.css
    const staticFiles = ["index.js", "index.css"];
    for (const file of staticFiles) {
      try {
        const fullPath = join(distPath, file);
        const content = readFileSync(fullPath);
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

    // Auto-detect and upload vendor chunks
    const chunksPath = resolve(distPath, "chunks");
    let chunkFiles: string[] = [];

    try {
      chunkFiles = readdirSync(chunksPath).filter(
        (file) =>
          file.startsWith("vendor-react") || file.startsWith("vendor-auth0")
      );
    } catch (e) {
      console.warn(
        `No chunks folder for ${screen}, skipping vendor chunks : ${e}`
      );
    }

    for (const file of chunkFiles) {
      const content = readFileSync(join(chunksPath, file));

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${screen}/${file}`,
          Body: content,
          ContentType: "application/javascript",
          CacheControl: "max-age=31536000",
        })
      );
      console.log(`Uploaded ${screen}/${file}`);
    }
  }

  // CloudFront invalidation
  await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    })
  );

  console.log("CloudFront cache invalidated");
}

deploy().catch(console.error);
