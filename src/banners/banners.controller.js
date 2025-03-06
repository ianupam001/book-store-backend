const Banner = require("./banners.model");

const createBanner = async (req, res) => {
    try {
        const { name, isVerified, status, page, link } = req.body;

        // If a file is uploaded, use its URL, otherwise use the provided link
        const bannerUrl = req.file
            ? `${process.env.DO_ENDPOINT}/${process.env.DO_BUCKET_NAME}/${req.file.key}`
            : link;

        if (!bannerUrl) {
            return res.status(400).json({ message: "Either upload a file or provide a banner link" });
        }

        const newBanner = new Banner({
            name,
            bannerUrl,
            link: link || '', // Save link if provided
            isVerified,
            status,
            page,
        });

        await newBanner.save();
        res.status(201).json({ message: "Banner created successfully", banner: newBanner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create banner" });
    }
};


const getBannersByPage = async (req, res) => {
    try {
        const { page } = req.params;
        const banners = await Banner.find({ page }).sort({ createdAt: -1 });
        res.status(200).json(banners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch banners" });
    }
};

const editBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log("Request Body:", req.body);
        console.log("Request File:", req.file);

        if (req.file && req.file.location) {
            updateData.bannerUrl = `${process.env.DO_ENDPOINT}/${process.env.DO_BUCKET_NAME}/${req.file.key}`;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedBanner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        res
            .status(200)
            .json({ message: "Banner updated successfully", banner: updatedBanner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update banner" });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete banner" });
    }
};

module.exports = {
    createBanner,
    getBannersByPage,
    editBanner,
    deleteBanner,
};
