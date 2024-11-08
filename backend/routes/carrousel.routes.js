const express = require('express');
const carrouselRouter = express.Router();

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: "ASIAU5PBNJM7FAEJODV2",
    secretAccessKey: "WoZTmKl9xwI01YHlw0jJy",
    sessionToken: "IQoJb3JpZ2luX2VjENH//////////wEaCXVzLXdlc3QtMiJHMEUCIQDaAFpJ5Gy9qb+OfnoG7cXjUkZW+ifOHcmufXtnynvmlAIgJH0RW4Z7VvGrlGwp2Jn489IeHN/71XeCPs0NoHaMvFMquAIIWhABGgwzMzgxNjQ1MzQwNzgiDEKH/+kGo3sJZAhqKCqVAu06UOf5x6Z+duV7WRhmbPqtlQsfQD2fzCZlDAQuHDMmyRIiiNDOIDAuc0L4T+C6HfOpmX/cVBRCGpHZi10tharZaDxADUqtKDg0H1imYA5XJZbxf1glQXdgtH/sGBdBEyHg7BkIIRjNdqrvo3tKaBE7idUmjLPI8sp8LD61e+lvahDOfNAZ57WRI6FwpRChKZ2Fz6dRSm+6EpJWXkDWOx4ta5YiXcfZsE+aD6wyHN3aoPyqZtw0nh7LcdK6VShPsDPliC4fx99DccjxtgZzpQVugyMiufiu4kMn3iXu+TWcVtcDj+wFQpssvzVw1NNXk/c/Zv4AZ03ddE0r05MN73d4RXBxDn7C3cuQhu6bsvDv+AOGGDAwvZS3uQY6nQEVqYvwPW3Umwy4FVcruxpnclCO23ysoa5DeH8v9jjYMG6Pax+4V2cIDbsC9q/8zEodzoCGZVx1ihBht4E5k3vHJeMwSqHadqOf2NiedCNmrknUIJOUxYnAByG1PCMyAGozRv9B0jUd8YnStQo0OeXYjtCLZjGQM3Pdygg5s8cmGZbmmkhTstcbT9tp+wmBbE/1fYAQfuK8RcX5iekh",
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