import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.BUCKET_NAME ;
export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.fileName;
  const contentType = event.headers["Content-Type"] || '';
  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "File name is required" })
    }
  }
  const key = `upload/${fileName}`;
    const command = new PutObjectCommand ({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType 
    });
    const url = await getSignedUrl(client, command, {expiresIn: 3600});
    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    };
  } catch (error) {
    // console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "failed to fetch presigned url" })
    };
  }
};