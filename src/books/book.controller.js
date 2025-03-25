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
    const { page = 1, limit = 60, search = '', format, language, sort } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Define search filter
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

    // Define format filter (if provided)
    const formatFilter = format ? { format: format } : {};

    // Define language filter (if provided)
    const languageFilter = language ? { language: language } : {};

    // Sorting options
    let sortOption = {};
    switch (sort) {
      case 'mostPopular':
        sortOption = { reviews: -1 };
        break;
      case 'mostReviews':
        sortOption = { reviews: -1 };
        break;
      case 'justListed':
        sortOption = { createdAt: -1 };
        break;
      case 'titleAZ':
        sortOption = { title: 1 };
        break;
      case 'titleZA':
        sortOption = { title: -1 };
        break;
      case 'priceLowHigh':
        sortOption = { price: 1 };
        break;
      case 'priceHighLow':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Fetch books with pagination, filters, and sorting
    const books = await BulkImport.find({
      ...searchFilter,
      ...formatFilter,
      ...languageFilter,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    // Get the total count of books matching the filter
    const totalBooks = await BulkImport.countDocuments({
      ...searchFilter,
      ...formatFilter,
      ...languageFilter,
    });

    // Send response
    res.status(200).send({
      books,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
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
    const { page = 1, limit = 10, sort } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Define sorting options
    let sortOption = {};
    if (sort === 'mostPopular') {
      sortOption = { count: -1 }; // Sort by number of books (most popular)
    } else if (sort === 'nameAZ') {
      sortOption = { author: 1 }; // Sort alphabetically A-Z
    }

    // Aggregate authors with book count
    const authorsWithBooks = await BulkImport.aggregate([
      {
        $unwind: "$authors"
      },
      {
        $group: {
          _id: "$authors",
          books: { $push: "$title" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          author: "$_id",
          books: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limitNumber }
    ]);

    // Get total count of authors
    const totalAuthors = await BulkImport.aggregate([
      { $unwind: "$authors" },
      { $group: { _id: "$authors" } },
      { $count: "total" }
    ]);

    const totalCount = totalAuthors.length ? totalAuthors[0].total : 0;

    res.status(200).json({
      success: true,
      data: authorsWithBooks,
      totalAuthors: totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch authors", error: error.message });
  }
};


const getPublishers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Define sorting options
    let sortOption = {};
    if (sort === 'mostPopular') {
      sortOption = { count: -1 }; // Sort by number of books (most popular)
    } else if (sort === 'nameAZ') {
      sortOption = { publisher: 1 }; // Sort alphabetically A-Z
    }

    // Aggregate publishers with book count
    const publishersWithBooks = await BulkImport.aggregate([
      {
        $group: {
          _id: "$publisher",
          books: { $push: "$title" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          publisher: "$_id",
          books: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limitNumber }
    ]);

    // Get total count of publishers
    const totalPublishers = await BulkImport.aggregate([
      { $group: { _id: "$publisher" } },
      { $count: "total" }
    ]);

    const totalCount = totalPublishers.length ? totalPublishers[0].total : 0;

    res.status(200).json({
      success: true,
      data: publishersWithBooks,
      totalPublishers: totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch publishers", error: error.message });
  }
};



const newReleases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      format,
      language,
      sortBy = 'releaseDate'
    } = req.query;

    const filter = { status: 'Active' };

    if (format) filter.format = format;
    if (language) filter.language = language;

    const sortOptions = {
      'most-popular': { reviews: -1 },
      'most-reviews': { reviews: -1 },
      'just-listed': { createdAt: -1 },
      'title-a-z': { title: 1 },
      'title-z-a': { title: -1 },
      'price-low-high': { price: 1 },
      'price-high-low': { price: -1 },
      'release-date': { releaseDate: -1 },
    };

    const sortCriteria = sortOptions[sortBy] || { releaseDate: -1 };

    const books = await BulkImport.find(filter)
      .sort(sortCriteria)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalBooks = await BulkImport.countDocuments(filter);

    return res.json({
      total: totalBooks,
      page: parseInt(page),
      limit: parseInt(limit),
      books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Failed to fetch books' });
  }
};

const getBooksByCategory = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      page = 1,
      limit = 10,
      format,
      language,
      sortBy = 'new-releases',
    } = req.query;

    const filter = { status: 'Active' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search by title
        { categories: { $regex: search, $options: 'i' } }, // Case-insensitive search by category
      ];
    }

    if (category) filter.categories = { $regex: category, $options: 'i' };
    if (format) filter.format = format;
    if (language) filter.language = language;

    const sortOptions = {
      'most-popular': { reviews: -1 },
      'new-releases': { releaseDate: -1 },
      'best-rated': { reviews: -1 },
    };

    const books = await BulkImport.find(filter)
      .sort(sortOptions[sortBy] || { releaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalBooks = await BulkImport.countDocuments(filter);

    res.json({
      total: totalBooks,
      page: parseInt(page),
      limit: parseInt(limit),
      books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

const getPopularSeries = async (req, res) => {
  try {
    // Fetch distinct series names from the database where status is "Active"
    const seriesList = await BulkImport.distinct("seriesName");

    res.json({
      total: seriesList.length,
      series: seriesList,
    });
  } catch (error) {
    console.error("Error fetching popular series:", error);
    res.status(500).json({ message: "Failed to fetch popular series" });
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
  newReleases,
  getBooksByCategory,
  getPopularSeries
};
