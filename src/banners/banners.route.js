const express = require("express");
const {
    createBanner,
    getBannersByPage,
    editBanner,
    deleteBanner,
} = require("../banners/banners.controller");
const { upload } = require("../utils/s3Uploader");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: API for managing banners
 */

/**
 * @swagger
 * /api/banners/upload:
 *   post:
 *     summary: Upload a new banner image
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Banner uploaded successfully
 *       400:
 *         description: Bad request
 */
router.post("/upload", upload.single("banner"), (req, res, next) => {
    next();
}, createBanner);

/**
 * @swagger
 * /api/banners/create:
 *   post:
 *     summary: Create a new banner
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Sale Banner"
 *               imageUrl:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/example.jpg"
 *               page:
 *                 type: string
 *                 example: "home"
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create", createBanner);

/**
 * @swagger
 * /api/banners/{page}:
 *   get:
 *     summary: Get banners for a specific page
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: string
 *         example: "home"
 *     responses:
 *       200:
 *         description: List of banners for the page
 *       404:
 *         description: No banners found
 */
router.get("/:page", getBannersByPage);

/**
 * @swagger
 * /api/banners/edit/{id}:
 *   patch:
 *     summary: Edit a banner by ID
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d12345abcd67890ef12345"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *                 example: "Updated Banner Title"
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Banner not found
 */
router.patch("/edit/:id", upload.single("banner"), (req, res, next) => {
    console.log("Request Body:", req.body); // Should contain non-file fields
    console.log("Request File:", req.file); // Should contain the uploaded file
    next();
}, editBanner);

/**
 * @swagger
 * /api/banners/delete/{id}:
 *   delete:
 *     summary: Delete a banner by ID
 *     tags: [Banners]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d12345abcd67890ef12345"
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 */
router.delete("/delete/:id", deleteBanner);

module.exports = router;
