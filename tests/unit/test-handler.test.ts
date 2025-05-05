jest.mock('@aws-sdk/s3-request-presigner');

jest.mock('@aws-sdk/client-s3');

import { handler } from '../../src/app';
import { jest } from '@jest/globals';
import 'dotenv/config';
describe('GET /presigned-url', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BUCKET_NAME = "test-bucket";
  });
  afterAll(() => {
    jest.restoreAllMocks()
  })
  const getSignedUrlMock = jest.fn().mockReturnValue('https://mock-url.com');
  it('should return 400 for missing fileName', async () => {
    const event = {
      queryStringParameters: null, 
      headers: {}
    } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe("File name is required");
  });

  it('should return 200 on getting signedUrl', async () => {
    getSignedUrlMock.mockReturnValue('https://mock-url.com');
    const event = {
      queryStringParameters: { fileName: "video.mp4" },
      headers: { 'Content-Type': 'video/mp4' }
    } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).url).toMatch(/^https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\/upload\/video\.mp4/);
  });
  it('should return 500 on error', async () => {
    getSignedUrlMock.mockImplementation(() => {
      throw new Error("failed to fetch presigned url")
    });
    const event = {
      queryStringParameters: { fileName: "test.txt" },
    } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe("failed to fetch presigned url");
  });
})
