const express = require("express");
const { getAdminStats } = require("./adminStats.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API for fetching admin statistics
 */

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get admin statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns statistics about books, authors, publishers, and categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks:
 *                   type: integer
 *                   example: 1200
 *                 totalAuthors:
 *                   type: integer
 *                   example: 350
 *                 totalPublishers:
 *                   type: integer
 *                   example: 50
 *                 totalCategories:
 *                   type: integer
 *                   example: 15
 *       500:
 *         description: Failed to fetch book stats
 */
router.get("/", getAdminStats, verifyAdminToken);

module.exports = router;
