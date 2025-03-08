const BulkImport = require("../books/bulkBooks.model");

/**
 * Get admin statistics including total books, authors, publishers, and categories.
 */
exports.getAdminStats = async (req, res) => {
    try {
        // 1. Total number of books
        const totalBooks = await BulkImport.countDocuments();

        // 2. Total unique authors
        const authorsResult = await BulkImport.aggregate([
            { $unwind: "$authors" },
            { $group: { _id: "$authors" } },
            { $count: "totalAuthors" },
        ]);
        const totalAuthors =
            authorsResult.length > 0 ? authorsResult[0].totalAuthors : 0;

        // 3. Total unique publishers
        const publishersResult = await BulkImport.aggregate([
            { $group: { _id: "$publisher" } },
            { $count: "totalPublishers" },
        ]);
        const totalPublishers =
            publishersResult.length > 0 ? publishersResult[0].totalPublishers : 0;

        // 4. Total unique categories
        const categoriesResult = await BulkImport.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories" } },
            { $count: "totalCategories" },
        ]);
        const totalCategories =
            categoriesResult.length > 0 ? categoriesResult[0].totalCategories : 0;

        res.status(200).json({
            totalBooks,
            totalAuthors,
            totalPublishers,
            totalCategories,
        });
    } catch (error) {
        console.error("Error fetching book stats:", error);
        res.status(500).json({ message: "Failed to fetch book stats" });
    }
};
