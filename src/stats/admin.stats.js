const mongoose = require('mongoose');
const express = require('express');
const Order = require('../orders/order.model');
const Book = require('../books/book.model');
const BulkImport = require('../books/bulkBooks.model');  // Update the model import
const router = express.Router();

// Function to calculate admin stats
router.get("/", async (req, res) => {
    try {
        // 1. Total number of orders
        const totalOrders = await Order.countDocuments();

        // 2. Total sales (sum of all totalPrice from orders)
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPrice" },
                }
            }
        ]);

        // 4. Trending books statistics: 
        const trendingBooksCount = await BulkImport.aggregate([  // Use BulkImport model
            { $match: { reviews: { $gt: 0 } } },  // Match only books with reviews
            { $count: "trendingBooks" }  // Return the count of books with reviews
        ]);

        const trendingBooks = trendingBooksCount.length > 0 ? trendingBooksCount[0].trendingBooks : 0; // Get the count of trending books

        // 5. Total number of books
        const totalBooks = await BulkImport.countDocuments();

        // 6. Monthly sales (group by month and sum total sales for each month)
        const monthlySales = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },  // Group by year and month
                    totalSales: { $sum: "$totalPrice" },  // Sum totalPrice for each month
                    totalOrders: { $sum: 1 }  // Count total orders for each month
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Result summary
        res.status(200).json({
            totalOrders,
            totalSales: totalSales[0]?.totalSales || 0,
            trendingBooks,
            totalBooks,
            monthlySales,
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
});

module.exports = router;
