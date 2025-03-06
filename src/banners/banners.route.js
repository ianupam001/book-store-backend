const express = require('express');
const { createBanner, getBannersByPage, editBanner, deleteBanner } = require('../banners/banners.controller');
const { upload } = require('../utils/s3Uploader');

const router = express.Router();

router.post('/upload', upload.single('banner'), (req, res, next) => { next() }, createBanner);
router.post('/create', createBanner);
router.get('/:page', getBannersByPage);
router.patch('/edit/:id', upload.single('banner'), (req, res, next) => {
    console.log('Request Body:', req.body); // Should contain non-file fields
    console.log('Request File:', req.file); // Should contain the uploaded file
    next();
}, editBanner);
router.delete('/delete/:id', deleteBanner);

module.exports = router;
