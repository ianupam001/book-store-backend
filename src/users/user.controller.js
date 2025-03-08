const User = require("./user.model");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

/**
 * Admin login controller
 */
exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find admin user
        const admin = await User.findOne({ username });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found!" });
        }

        // Check password
        if (admin.password !== password) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Authentication successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Failed to login as admin", error);
        res.status(500).json({ message: "Failed to login as admin" });
    }
};
