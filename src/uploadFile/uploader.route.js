const express = require('express');
const { upload } = require('../utils/s3Uploader');
const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file to DigitalOcean Spaces
 *     description: Uploads a single file to DigitalOcean Spaces and returns the file URL.
 *     tags:
 *       - Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               page:
 *                 type: string
 *                 description: The folder name where the file should be stored
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 fileUrl:
 *                   type: string
 *                   example: https://your-space-name.nyc3.digitaloceanspaces.com/folder/filename.jpg
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `${process.env.DO_ENDPOINT}/${process.env.DO_BUCKET_NAME}/${req.file.key}`

    res.json({
        message: 'File uploaded successfully',
        fileUrl: url,
    });
});

module.exports = router;
