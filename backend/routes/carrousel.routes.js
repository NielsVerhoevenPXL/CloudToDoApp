const express = require('express');
const carrouselRouter = express.Router();
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

carrouselRouter.get('', async (req, res) => {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Prefix: 'pictures/' // This matches your S3 directory structure
        };

        const data = await s3.listObjects(params).promise();
        const images = data.Contents
            .filter(item => item.Key.match(/\.(jpg|jpeg|png|gif)$/i))
            .map(item => ({
                url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
                name: item.Key.split('/').pop()
            }));

        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

module.exports = carrouselRouter;