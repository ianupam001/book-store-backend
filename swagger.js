const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config(); // Load .env variables

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Books Web API Documentation",
            version: "1.0.0",
            description: "API documentation for Books Web",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local server",
            },
            {
                url: "https://api.booksweb.org",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                basicAuth: {
                    type: "http",
                    scheme: "basic",
                    description: "Enter your admin username and password.",
                },
            },
        },
        security: [{ basicAuth: [] }],
    },
    apis: [path.join(__dirname, "../**/*.route.js")], // Ensure it scans all route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", (req, res, next) => {
        const auth = {
            username: process.env.SWAGGER_USER,
            password: process.env.SWAGGER_PASSWORD
        };

        const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
        const [user, pass] = Buffer.from(b64auth, "base64").toString().split(":");

        if (!user || !pass || user !== auth.username || pass !== auth.password) {
            res.set("WWW-Authenticate", 'Basic realm="401"');
            return res.status(401).send("Authentication required.");
        }

        next();
    }, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    console.log("Swagger docs available at:");
    console.log("➡ Local: http://localhost:5000/api-docs");
    console.log("➡ Production: https://api.booksweb.org/api-docs");
};

module.exports = setupSwagger;
