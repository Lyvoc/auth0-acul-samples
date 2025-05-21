import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import fg from "fast-glob";
import { readFileSync } from "fs";
import { join, resolve } from "path";

dotenv.config();

async function deploy() {
  const region = "eu-north-1";
  const s3 = new S3Client({ region });
  const cloudfront = new CloudFrontClient({ region });

  const bucket = process.env.S3_BUCKET;
  const distributionId = process.env.CLOUDFRONT_ID;
  const distRoot = resolve("dist");

  // Match all .js and .css files in dist/** (preserves nested folder structure)
  const files = await fg(["**/*.js", "**/*.css"], { cwd: distRoot });

  for (const relativePath of files) {
    const filePath = join(distRoot, relativePath);
    const content = readFileSync(filePath);
    const contentType = relativePath.endsWith(".js")
      ? "application/javascript"
      : "text/css";

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: relativePath,
        Body: content,
        ContentType: contentType,
        CacheControl: "max-age=31536000",
      })
    );

    console.log(`✅ Uploaded ${relativePath}`);
  }

  // Invalidate all CloudFront paths
  await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    })
  );

  console.log("🚀 CloudFront cache invalidated");
}

deploy().catch(console.error);
