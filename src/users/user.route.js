const express = require("express");
const { adminLogin } = require("./user.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Admin authentication API
 */

/**
 * @swagger
 * /api/auth/admin:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     description: Authenticate an admin and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "adminUser"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "adminUser"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.post("/admin", adminLogin);

module.exports = router;
