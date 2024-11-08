const express = require('express');
const carrouselRouter = express.Router();
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

async function getImageUrlsFromS3Bucket() {
    const params = {
        Prefix: 'pictures/'
    };

    try {
        console.log('Fetching images from S3 bucket...');
        const data = await s3.listObjectsV2(params).promise();
        console.log('Raw data from S3:', data); // Log the full data to inspect Contents
        const images = data.Contents
            .filter(item => item.Size > 0 && item.Key.match(/\.(jpeg|jpg|gif|png)$/i)) 
            .map(item => {
                const imageUrl = `https://automation-pe-2-cumbucket.s3.amazonaws.com/${item.Key}`; 
                return { url: imageUrl };
            });
        console.log('Filtered images:', images); // Log the final image array to check URLs
        return images;
    } catch (error) {
        console.error('Error fetching images from S3 bucket:', error);
        return [];
    }
}

carrouselRouter.get('', async (req, res) => {
    try {
        const imageUrls = await getImageUrlsFromS3Bucket();
        res.json(imageUrls);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = carrouselRouter;
