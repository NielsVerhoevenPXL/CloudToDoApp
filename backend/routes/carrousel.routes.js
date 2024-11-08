const express = require('express');
const AWS = require('aws-sdk');
const carrouselRouter = express.Router();

const s3 = new AWS.S3();

carrouselRouter.get('', (req, res) => {
    const params = {
      Bucket: 'automation-pe-2-cumbucket',
      Prefix: 'images/'
    };
  
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        const imageUrls = data.Contents
          .filter(item => item.Key !== 'images/') // Exclude the 'images/' prefix
          .map(item => ({ url: `https://automation-pe-2-cumbucket.s3.amazonaws.com/${item.Key}` }));
        res.json(imageUrls);
      }
    });
  });
  
module.exports = carrouselRouter;
