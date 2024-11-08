const express = require('express');
const carrouselRouter = express.Router();

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1',
});

carrouselRouter.get('', (req, res) => {
    const params = {
        Bucket: "automation-pe-2-cumbucket",
    };

    s3.listObjectsV2(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const jpgImages = data.Contents.filter((obj) => {
            return obj.Key.endsWith('.jpg');
        });

        const images = jpgImages.map((obj) => {
            const url = s3.getSignedUrl('getObject', {
                Bucket: params.Bucket,
                Key: obj.Key,
                Expires: 60,
            });
            return { url };
        });

        res.json(images);
    });
});

module.exports = carrouselRouter;