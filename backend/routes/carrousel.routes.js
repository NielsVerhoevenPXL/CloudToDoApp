const express = require('express');
const carrouselRouter = express.Router();
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

async function getImagePreSignedUrls() {
  const params = {
    Bucket: 'automation-pe-2-cumbucket',
    Prefix: 'pictures/',
    Expires: 60, // Set the expiration time (in seconds) for the pre-signed URLs
  };

  try {
    console.log('Fetching pre-signed URLs from S3 bucket...');
    const data = await s3.listObjectsV2(params).promise();
    const preSignedUrls = await Promise.all(
      data.Contents.filter((item) => item.Size > 0 && item.Key.match(/\.(jpeg|jpg|gif|png)$/i)).map(async (item) => {
        const url = await s3.getSignedUrlPromise('getObject', {
          Bucket: 'automation-pe-2-cumbucket',
          Key: item.Key,
          Expires: params.Expires,
        });
        return { url };
      })
    );
    console.log('Pre-signed URLs:', preSignedUrls);
    return preSignedUrls;
  } catch (error) {
    console.error('Error fetching pre-signed URLs from S3 bucket:', error);
    return [];
  }
}

carrouselRouter.get('', async (req, res) => {
  try {
    const preSignedUrls = await getImagePreSignedUrls();
    res.json(preSignedUrls);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = carrouselRouter;
