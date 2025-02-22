const express = require("express");
const Book = require("./book.model");
const {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  getAllBulkBooks,
  bulkImportFromFile,
  getAuthors,
  getPublishers
} = require("./book.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// post a book
router.post("/create-book", verifyAdminToken, postABook);

router.post("/bulk-import", upload.single("file"), verifyAdminToken, bulkImportFromFile);

// get all books
router.get("/", getAllBooks);


// get all bulk books
router.get("/bulk", getAllBulkBooks);

router.get('/authors', getAuthors);
router.get('/publishers', getPublishers);

// single book endpoint
router.get("/:id", getSingleBook);


// update a book endpoint
router.put("/edit/:id", verifyAdminToken, UpdateBook);

router.delete("/:id", verifyAdminToken, deleteABook);

module.exports = router;
