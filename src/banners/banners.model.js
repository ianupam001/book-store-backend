const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    page: {
        type: String,
        enum: ['homePageBanners', 'productPageBanners'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    bannerUrl: {
        type: String,
        required: false,
    },
    link: {
        type: String,
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active',
    },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
