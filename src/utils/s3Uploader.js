const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
    region: process.env.DO_REGION,
    endpoint: process.env.DO_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || 'DO00NMTCCJLQ9J72ACRW',
        secretAccessKey: process.env.ACCESS_KEY || 'Czj5w++7StnpEZ6kKJoR1cB9GY92XreriOrTl84z6So',
    },
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.DO_BUCKET_NAME,
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },

        key: (req, file, cb) => {
            const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            process.nextTick(() => {
                const folder = req.body.page || 'general';
                const filename = `${folder}/${uniquePrefix}_${file.originalname}`;
                cb(null, filename);
            });
        },
    }),
});

module.exports = { upload };