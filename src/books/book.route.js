const express = require("express");
const {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  getAllBulkBooks,
  bulkImportFromFile,
  getAuthors,
  getPublishers,
  newReleases
} = require("./book.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books
 */

/**
 * @swagger
 * /api/books/create-book:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
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
 *                 example: "The Great Gatsby"
 *               author:
 *                 type: string
 *                 example: "F. Scott Fitzgerald"
 *               price:
 *                 type: number
 *                 example: 19.99
 *     responses:
 *       201:
 *         description: Book created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/create-book", postABook);

/**
 * @swagger
 * /api/books/bulk-import:
 *   post:
 *     summary: Bulk import books from a file
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       200:
 *         description: Books imported successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk-import", upload.single("file"), verifyAdminToken, bulkImportFromFile);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /api/books/bulk:
 *   get:
 *     summary: Get all bulk books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of bulk books
 */
router.get("/bulk", getAllBulkBooks);

/**
 * @swagger
 * /api/books/authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of authors
 */
router.get("/authors", getAuthors);

/**
 * @swagger
 * /api/books/publishers:
 *   get:
 *     summary: Get all publishers
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of publishers
 */
router.get("/publishers", getPublishers);

/**
 * @swagger
 * /api/books/new-releases:
 *   get:
 *     summary: Get all books sorted by release date
 *     description: Fetch all active books sorted by latest release date.
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Successfully retrieved all books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   releaseDate:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                     enum: [Active, Inactive]
 *       500:
 *         description: Server error.
 */
router.get('/new-releases', newReleases);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65d12345abcd67890ef12345"
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */
router.get("/:id", getSingleBook);

/**
 * @swagger
 * /api/books/edit/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Title"
 *               price:
 *                 type: number
 *                 example: 25.99
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.put("/edit/:id", verifyAdminToken, UpdateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
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
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.delete("/:id", verifyAdminToken, deleteABook);

module.exports = router;
