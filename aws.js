const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key',
    region: 'us-east-1',
});

export const read = (file) => s3.getObject(file).createReadStream();
