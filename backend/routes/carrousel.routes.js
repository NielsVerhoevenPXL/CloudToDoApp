const express = require('express');
const carrouselRouter = express.Router();

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: "ASIAU5PBNJM7FAEJODV2",
    secretAccessKey: "WoZTmKl9xwI01YHlw0jJy",
    region: 'us-east-1',
});

carrouselRouter.get('', async (req, res) => {
    const params = {
        Bucket: "automation-pe-2-cumbucket",
    };

    try {
        // Verify AWS credentials and bucket access
        await s3.headBucket(params).promise();
        
        const data = await s3.listObjectsV2(params).promise();
        
        // Check if Contents exists
        if (!data.Contents) {
            return res.json([]);
        }

        const jpgImages = data.Contents.filter(obj => obj.Key.endsWith('.jpg'));
        
        const images = jpgImages.map(obj => ({
            url: s3.getSignedUrl('getObject', {
                Bucket: params.Bucket,
                Key: obj.Key,
                Expires: 60,
            })
        }));

        res.json(images);
    } catch (error) {
        console.error('S3 Error:', error);
        
        // More specific error messages based on the error type
        if (error.code === 'NoSuchBucket') {
            return res.status(404).json({ error: 'Bucket not found' });
        }
        if (error.code === 'AccessDenied') {
            return res.status(403).json({ error: 'Access denied to bucket' });
        }
        if (error.code === 'InvalidAccessKeyId') {
            return res.status(401).json({ error: 'Invalid AWS credentials' });
        }
        
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = carrouselRouter;