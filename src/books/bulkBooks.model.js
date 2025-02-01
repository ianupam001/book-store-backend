const mongoose = require('mongoose');

const bulkImportSchema = new mongoose.Schema({
    ISBN: { type: String, required: true, unique: true },
    format: { type: String },
    title: { type: String, required: true },
    authors: [{ type: String }], // Includes Author 1, Author 2, Author 3
    categories: [{ type: String }], // Includes Category 1, Category 2, Category 3, Category 4, Category 5
    publisher: { type: String },
    language: { type: String },
    pages: { type: Number },
    ISBN10_ASIN_SKU: { type: String },
    releaseDate: { type: Date },
    weight: { type: String },
    dimensions: { type: String },
    reviews: { type: Number, default: 0 },
    seriesName: { type: String },
    currencyName: { type: String },
    price: { type: Number },
    sellingPrice: { type: Number },
    aboutTheBook: { type: String },
    aboutTheAuthor: { type: String },
    sampleChapters: { type: String },
    relatedKeywords: [{ type: String }],
    relatedSearches: [{ type: String }],
    imageLinks: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('BulkImport', bulkImportSchema);