const mongoose = require('mongoose');
const express = require('express');
const Order = require('../orders/order.model');
const Book = require('../books/book.model');
const BulkImport = require('../books/bulkBooks.model');  // Update the model import
const router = express.Router();

// Function to calculate admin stats
router.get("/", async (req, res) => {
    try {
        // 1. Total number of books
        const totalBooks = await BulkImport.countDocuments();

        // 2. Total unique authors
        const authorsResult = await BulkImport.aggregate([
            { $unwind: "$authors" }, // Flatten authors array
            { $group: { _id: "$authors" } }, // Group by unique authors
            { $count: "totalAuthors" } // Count unique authors
        ]);
        const totalAuthors = authorsResult.length > 0 ? authorsResult[0].totalAuthors : 0;

        // 3. Total unique publishers
        const publishersResult = await BulkImport.aggregate([
            { $group: { _id: "$publisher" } }, // Group by unique publishers
            { $count: "totalPublishers" } // Count unique publishers
        ]);
        const totalPublishers = publishersResult.length > 0 ? publishersResult[0].totalPublishers : 0;

        // 4. Total unique categories
        const categoriesResult = await BulkImport.aggregate([
            { $unwind: "$categories" }, // Flatten categories array
            { $group: { _id: "$categories" } }, // Group by unique categories
            { $count: "totalCategories" } // Count unique categories
        ]);
        const totalCategories = categoriesResult.length > 0 ? categoriesResult[0].totalCategories : 0;

        res.status(200).json({
            totalBooks,
            totalAuthors,
            totalPublishers,
            totalCategories
        });
    } catch (error) {
        console.error("Error fetching book stats:", error);
        res.status(500).json({ message: "Failed to fetch book stats" });
    }
});

module.exports = router;
