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
  newReleases,
  getBooksByCategory,
  getPopularSeries
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
 *     summary: Get all bulk books with pagination, search, filters, and sorting
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Number of books per page (default is 60)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (filters books by title, authors, ISBN, categories, or publisher)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [Audiobook, Board Book, eBook, Hardcover, Large Print, Loose Leaf, Mass Market, Paperback, Spiral-Bound, Unknown]
 *         description: Filter by book format
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [Afrikaans, Arabic, Bilingual, Chinese (Simplified), Chinese (Traditional), Dutch, English, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish, Swedish]
 *         description: Filter by language
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [mostPopular, mostReviews, justListed, titleAZ, titleZA, priceLowHigh, priceHighLow]
 *         description: Sorting option
 *     responses:
 *       200:
 *         description: Successfully retrieved list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier of the book
 *                       title:
 *                         type: string
 *                         description: Book title
 *                       authors:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of authors
 *                       ISBN:
 *                         type: string
 *                         description: ISBN of the book
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Book categories
 *                       format:
 *                         type: string
 *                         description: Book format
 *                       language:
 *                         type: string
 *                         description: Book language
 *                       price:
 *                         type: number
 *                         description: Price of the book
 *                       reviews:
 *                         type: integer
 *                         description: Number of reviews
 *                 totalBooks:
 *                   type: integer
 *                   description: Total number of books matching the query
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages available
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *       500:
 *         description: Failed to fetch books
 */
router.get("/bulk", getAllBulkBooks);

/**
 * @swagger
 * /api/books/authors:
 *   get:
 *     summary: Get all authors with pagination and sorting
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of authors per page (default is 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [mostPopular, nameAZ]
 *         description: Sorting option (mostPopular = most books, nameAZ = A-Z)
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       author:
 *                         type: string
 *                       books:
 *                         type: array
 *                         items:
 *                           type: string
 *                       count:
 *                         type: integer
 *                 totalAuthors:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Failed to fetch authors
 */
router.get("/authors", getAuthors);

/**
 * @swagger
 * /api/books/publishers:
 *   get:
 *     summary: Get all publishers with pagination and sorting
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of publishers per page (default is 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [mostPopular, nameAZ]
 *         description: Sorting option (mostPopular = most books, nameAZ = A-Z)
 *     responses:
 *       200:
 *         description: List of publishers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publisher:
 *                         type: string
 *                       books:
 *                         type: array
 *                         items:
 *                           type: string
 *                       count:
 *                         type: integer
 *                 totalPublishers:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Failed to fetch publishers
 */
router.get("/publishers", getPublishers);

/**
 * @swagger
 * /api/books/new-releases:
 *   get:
 *     summary: Get all books sorted by release date with pagination, sorting, and filters
 *     description: Fetch all active books sorted by latest release date with pagination and filtering options.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of books per page (default is 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [most-popular, most-reviews, just-listed, title-a-z, title-z-a, price-low-high, price-high-low, release-date]
 *         description: Sorting option
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [Audiobook, Board Book, eBook, Hardcover, Large Print, Loose Leaf, Mass Market, Paperback, Spiral-Bound, Unknown]
 *         description: Filter by book format
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [Afrikaans, Arabic, Bilingual, Chinese (Simplified), Chinese (Traditional), Dutch, English, French, German, etc.]
 *         description: Filter by language
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered books with pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       releaseDate:
 *                         type: string
 *                         format: date
 *                       format:
 *                         type: string
 *                       language:
 *                         type: string
 *                       price:
 *                         type: number
 *                       reviews:
 *                         type: integer
 *       500:
 *         description: Server error.
 */
router.get('/new-releases', newReleases);

/**
 * @swagger
 * /api/books/category:
 *   get:
 *     summary: Search books by category or title with filters
 *     description: Fetch books by category or title, supporting search, pagination, sorting, and filtering.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search books by title or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter books by a specific category (Fiction, Non-fiction, Mystery, Sci-Fi, Fantasy)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of books per page (default is 10)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [eBook, Paperback, Hardcover, Audiobook]
 *         description: Filter by book format
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [English, Spanish, French, German, Chinese]
 *         description: Filter by language
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [most-popular, new-releases, best-rated]
 *         description: Sorting option
 *     responses:
 *       200:
 *         description: Successfully retrieved books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                       format:
 *                         type: string
 *                       language:
 *                         type: string
 *                       price:
 *                         type: number
 *                       reviews:
 *                         type: integer
 *       500:
 *         description: Server error.
 */
router.get('/category', getBooksByCategory);

/**
 * @swagger
 * /api/books/popular/series:
 *   get:
 *     summary: Get popular book series
 *     description: Fetches unique book series names from the database.
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Successfully retrieved popular series.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of series
 *                 series:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Series name
 *       500:
 *         description: Server error.
 */
router.get('/popular/series', getPopularSeries);

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
