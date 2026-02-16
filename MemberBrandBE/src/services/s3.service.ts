import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const s3 = new AWS.S3({
  accessKeyId: config.s3_bucket.access_key_id,
  secretAccessKey: config.s3_bucket.secret_access_key,
  region: config.s3_bucket.region,
});
const BUCKET_NAME = "tribeme-bucket";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// uploadToS3Bucket
export async function uploadToS3(
  imageBuffer: Buffer,
  folder: string,
  id: string
) {
  try {
    const fileKey = `${process.env.NODE_ENV}/${folder}/${id}/${uuidv4()}.png`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: imageBuffer,
      ContentType: "image/png",
    };

    const uploadResult = await s3.upload(params).promise();
    console.log("Image Uploaded to S3 successfully");
    return uploadResult.Location; 
  } catch (error) {
    console.error("Error uploading to S3", error);
    throw new Error("S3 upload failed");
  }
}

export async function uploadImage(
  imageBuffer: Buffer,
  folder: string,
  id: string,
  storageType: "cloudinary" | "s3"
) {
   if (storageType === "s3") {
    return await uploadToS3(imageBuffer, folder, id);
  } else {
    throw new Error("Invalid storage type");
  }
}

export const uploadToS3Stream = (
  stream: Readable,
  folder: string,
  fileName: string,
  contentType: string
): Promise<string> => {
  const key = `${folder}/${fileName}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: stream,
    ContentType: contentType,
  };

  return new Promise((resolve, reject) => {
    const managedUpload = s3.upload(uploadParams);

    managedUpload.on("httpUploadProgress", (progress) => {
      console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
    });

    managedUpload.send((err, data) => {
      if (err) {
        console.error("S3 upload error:", err);
        reject(err);
        return;
      }
      resolve(data.Location);
    });
  });
};
