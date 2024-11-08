const express = require('express');
const carrouselRouter = express.Router();

const AWS = require('aws-sdk');

// Enable AWS SDK debugging
AWS.config.logger = console;

// Log environment variables (redacted for security)
console.log('AWS Access Key exists:', !!process.env.AWS_ACCESS_KEY);
console.log('AWS Secret Key exists:', !!process.env.AWS_SECRET_KEY);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1',
});

carrouselRouter.get('', async (req, res) => {
    console.log('Starting carousel route handler');
    
    const params = {
        Bucket: "automation-pe-2-cumbucket",
    };

    try {
        console.log('Checking bucket accessibility...');
        // First check if we can access the bucket
        try {
            await s3.headBucket(params).promise();
            console.log('Bucket is accessible');
        } catch (bucketError) {
            console.error('Bucket check failed:', bucketError.code, bucketError.message);
            throw bucketError;
        }

        console.log('Listing objects from bucket...');
        const data = await s3.listObjectsV2(params).promise();
        console.log('Retrieved object list. Count:', data.Contents?.length || 0);

        if (!data.Contents) {
            console.log('No contents found in bucket');
            return res.json([]);
        }

        console.log('Filtering JPG images...');
        const jpgImages = data.Contents.filter(obj => obj.Key.endsWith('.jpg'));
        console.log('Found JPG images:', jpgImages.length);

        console.log('Generating signed URLs...');
        const images = jpgImages.map(obj => {
            try {
                const url = s3.getSignedUrl('getObject', {
                    Bucket: params.Bucket,
                    Key: obj.Key,
                    Expires: 60,
                });
                return { url };
            } catch (urlError) {
                console.error('Error generating signed URL for:', obj.Key, urlError);
                throw urlError;
            }
        });

        console.log('Successfully generated URLs for', images.length, 'images');
        res.json(images);
        
    } catch (error) {
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            requestId: error.requestId,
            statusCode: error.statusCode,
            time: new Date().toISOString()
        });

        // More specific error responses
        switch(error.code) {
            case 'NoSuchBucket':
                return res.status(404).json({ 
                    error: 'Bucket not found',
                    details: error.message
                });
            case 'AccessDenied':
                return res.status(403).json({ 
                    error: 'Access denied to bucket',
                    details: error.message
                });
            case 'InvalidAccessKeyId':
            case 'SignatureDoesNotMatch':
                return res.status(401).json({ 
                    error: 'Invalid AWS credentials',
                    details: error.message
                });
            default:
                res.status(500).json({ 
                    error: 'Internal Server Error',
                    code: error.code,
                    message: error.message
                });
        }
    }
});

module.exports = carrouselRouter;