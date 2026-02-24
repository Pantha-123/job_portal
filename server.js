const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const HR_PASSWORD = "tender";

// Protect HR routes
app.use("/hr", (req, res, next) => {
    const pass = req.query.key;
    if (pass === HR_PASSWORD) next();
    else return res.send("Unauthorized");
});

// Download Excel
app.get("/hr/download", (req, res) => {
    const file = "applications.xlsx";
    if (fs.existsSync(file))
        res.download(file);
    else
        res.send("No applications yet");
});

// VERY IMPORTANT LINE
app.use("/hr/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});