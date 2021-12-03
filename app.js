const express = require("express");
const dotenv = require("dotenv");
const domains = require("./Domains");
const bodyParser = require("body-parser");

// Load config
dotenv.config({ path: "./config/config.env" });

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/domain", require("./routes/api/domain"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
