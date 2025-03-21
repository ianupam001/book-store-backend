const Book = require("./book.model");
const BulkImport = require("./bulkBooks.model");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const postABook = async (req, res) => {
  try {
    const newBook = await BulkImport({ ...req.body });
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
    const updatedBook = await BulkImport.findByIdAndUpdate(id, req.body, {
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
    const deletedBook = await BulkImport.findByIdAndDelete(id);
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

const bulkImportFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
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
    // Extract query parameters
    const { page = 1, limit = 60, search = '' } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;


    // Define the search filter
    const searchFilter = search
      ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { authors: { $regex: search, $options: 'i' } },
          { categories: { $regex: search, $options: 'i' } },
          { publisher: { $regex: search, $options: 'i' } },
          { ISBN: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    // Fetch books with pagination and search filter
    const books = await BulkImport.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Log the number of books fetched for debugging
    const fetchedBooks = books.length

    // Get the total count of books matching the filter
    const totalBooks = await BulkImport.countDocuments(searchFilter);

    // Send the response with pagination metadata
    res.status(200).send({
      books,
      fetchedBooks,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Error fetching books', error);
    res.status(500).send({ message: 'Failed to fetch books' });
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
    const authorsWithBooks = await BulkImport.aggregate([
      {
        $group: {
          _id: "$authors",
          books: { $push: "$title" }, // Collect book titles
          count: { $sum: 1 } // Count the number of books
        }
      },
      {
        $project: {
          author: "$_id",
          books: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({ success: true, data: authorsWithBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch authors', error: error.message });
  }
};

const getPublishers = async (req, res) => {
  try {
    const publishersWithBooks = await BulkImport.aggregate([
      {
        $group: {
          _id: "$publisher",
          books: { $push: "$title" }, // Collect book titles
          count: { $sum: 1 } // Count the number of books
        }
      },
      {
        $project: {
          publisher: "$_id",
          books: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({ success: true, data: publishersWithBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch publishers', error: error.message });
  }
};

const newReleases = async () => {
  try {
    const newReleases = await BulkImport.find(
      { status: 'Active' }, // Fetch only active books
      { imageLinks: 1, ISBN: 1, _id: 0 } // Projection: Only return imageLinks & ISBN
    ).sort({ releaseDate: -1 }); // Sort by latest releaseDate

    return newReleases;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw new Error('Failed to fetch books');
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
  getPublishers,
  newReleases
};
