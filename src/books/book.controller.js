const Book = require("./book.model");
const BulkImport = require("./bulkBooks.model");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const postABook = async (req, res) => {
  try {
    const newBook = await Book({ ...req.body });
    await newBook.save();
    res
      .status(200)
      .send({ message: "Book posted successfully", book: newBook });
  } catch (error) {
    console.error("Error creating book", error);
    res.status(500).send({ message: "Failed to create book" });
  }
};

// get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).send({ message: "Failed to fetch books" });
  }
};


// update book data
const UpdateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      res.status(404).send({ message: "Book is not Found!" });
    }
    res.status(200).send({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating a book", error);
    res.status(500).send({ message: "Failed to update a book" });
  }
};

const deleteABook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      res.status(404).send({ message: "Book is not Found!" });
    }
    res.status(200).send({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error("Error deleting a book", error);
    res.status(500).send({ message: "Failed to delete a book" });
  }
};

const bulkUpload = async (req, res) => {
  try {
    const { books } = req.body;

    console.log("Payload size:", JSON.stringify(books).length); // Log payload size

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: "Invalid books data" });
    }

    // Validate each book
    for (const book of books) {
      if (!book.ISBN || !book.Title || !book.Author) {
        return res.status(400).json({ message: "Missing required fields" });
      }
    }

    const chunkSize = 100; // Number of books per chunk
    const insertedBooks = [];

    for (let i = 0; i < books.length; i += chunkSize) {
      const chunk = books.slice(i, i + chunkSize);
      const result = await Bulkbook.insertMany(chunk);
      insertedBooks.push(...result);
    }

    res.status(201).json({
      message: "Books imported successfully",
      data: insertedBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to import books" });
  }
};



const bulkImportFromFile = async (req, res) => {
  try {
    const { path } = req.file; // Ensure the file is uploaded
    const workbook = xlsx.readFile(path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Map and normalize fields
    const formattedData = rawData.map(row => ({
      ISBN: row['ISBN'],
      format: row['Format'],
      title: row['Title'],
      authors: [row['Author 1'], row['Author 2'], row['Author 3']].filter(Boolean), // Remove null/undefined
      categories: [row['Category 1'], row['Category 2'], row['Category 3'], row['Category 4'], row['Category 5']].filter(Boolean),
      publisher: row['Publisher'],
      language: row['Language'],
      pages: parseInt(row['Pages'], 10) || 0,
      ISBN10_ASIN_SKU: row['ISBN 10/ASIN/SKU'],
      releaseDate: row['Release Date'] ? new Date(row['Release Date']) : null,
      weight: row['Weight'],
      dimensions: row['Dimensions'],
      reviews: parseInt(row['Reviews'], 10) || 0,
      seriesName: row['Series Name'],
      currencyName: row['Currency Name'],
      price: parseFloat(row['Price (MRP)']) || 0,
      sellingPrice: parseFloat(row['Selling Price']) || 0,
      aboutTheBook: row['About the Book'],
      aboutTheAuthor: row['About the Author'],
      sampleChapters: row['Sample Chapters'],
      relatedKeywords: row['Related Keywords']?.split(',').map(k => k.trim()) || [],
      relatedSearches: row['Related Searches']?.split(',').map(s => s.trim()) || [],
      imageLinks: row['Image Links']?.split(',').map(link => link.trim()) || [],
      status: row['Status'] || 'Active', // Default to 'Active'
    }));

    // Insert into database
    await BulkImport.insertMany(formattedData);

    res.status(200).send({ message: 'Bulk import successful', data: formattedData });
  } catch (err) {
    console.error('Bulk import failed:', err);
    res.status(400).send({ message: 'Failed to import books', error: err.message });
  }
};




const getAllBulkBooks = async (req, res) => {
  try {
    const books = await BulkImport.find().sort({ createdAt: -1 });
    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).send({ message: "Failed to fetch books" });
  }
};

const getSingleBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BulkImport.findById(id);
    if (!book) {
      res.status(404).send({ message: "Book not Found!" });
    }
    res.status(200).send(book);
  } catch (error) {
    console.error("Error fetching book", error);
    res.status(500).send({ message: "Failed to fetch book" });
  }
};

const getAuthors = async (req, res) => {
  try {
    const authors = await BulkImport.distinct('authors');
    res.status(200).json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch authors', error: error.message });
  }
};

const getPublishers = async (req, res) => {
  try {
    const publishers = await BulkImport.distinct('publisher');
    res.status(200).json({ success: true, data: publishers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch publishers', error: error.message });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  bulkImportFromFile,
  getAllBulkBooks,
  getAuthors,
  getPublishers
};
