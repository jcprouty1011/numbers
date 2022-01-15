const express = require("express");
const { Pool } = require("pg");
const app = express();

const CREATED = 201;
const FORBIDDEN = 403;
const INTERNAL_SERVER_ERROR = 500;


// CONFIGURATION
// This API is open to a single user.
const { AUTH_TOKEN, DATABASE_URL, USE_SSL } = process.env;
const dbConfig = { connectionString: DATABASE_URL };
if (USE_SSL) {
    dbConfig.ssl = {};
    dbConfig.ssl.rejectUnauthorized = false;
}
const pool = new Pool(dbConfig);


// MIDDLEWARE

app.use("*", (req, res, next) => {
    const authToken = req.get("Authorization")?.split(" ");
    if (authToken && authToken[0] === "Bearer" && authToken[1] === AUTH_TOKEN) {
        next();
    } else {
        res.status(FORBIDDEN).send("Error: you don't have permission to do this.");
    }
});
app.use(express.json());


//ROUTES

app.get("/", (req, res) => {
    res.send("The API is running!");
});

app.get("/timestamps", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM timestamps");
        res.send({timestamps: rows});
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).send("Internal server error.");
    }
});

app.post("/timestamps", async (req, res) => {
    try {
        await pool.query(
            "INSERT INTO timestamps (label, stamp) VALUES ($1, NOW())",
            [req.body.label]
        );
        res.status(CREATED).end();
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).send("Internal server error.");
    }
});

app.listen(5000, () => {
    console.log("Running SelfNumbers server.");
});
