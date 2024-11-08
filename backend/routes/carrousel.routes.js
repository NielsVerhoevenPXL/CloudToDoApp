const express = require('express');
const AWS = require('aws-sdk');
const carrouselRouter = express.Router();

const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME || 'automation-pe-2-cumbucket';

carrouselRouter.get('', (req, res) => {
  const params = {
    Bucket: bucketName,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching images');
    } else {
      const imageUrls = data.Contents.map(item => {
        return `https://${bucketName}.s3.amazonaws.com/${item.Key}`;
      });
      res.json(imageUrls);
    }
  });
});

module.exports = carrouselRouter;