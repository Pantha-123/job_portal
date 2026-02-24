const path = require("path");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* ================= FILE STORAGE ================= */

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const unique = uuidv4();
        cb(null, unique + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* ================= EXCEL FUNCTION ================= */

function saveToExcel(data){

    const file = "applications.xlsx";
    let workbook;
    let worksheet;
    let jsonData = [];

    if(fs.existsSync(file)){
        workbook = XLSX.readFile(file);
        worksheet = workbook.Sheets["Applicants"];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
    }else{
        workbook = XLSX.utils.book_new();
    }

    jsonData.push(data);

    worksheet = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    XLSX.writeFile(workbook, file);
}

/* ================= APPLICATION SUBMIT ================= */

app.post("/apply",
upload.fields([
    { name: "photo" },
    { name: "audio" },
    { name: "video" }
]),
(req, res) => {

    const applicantID = uuidv4();

    const applicant = {
        Applicant_ID: applicantID,
        Name: req.body.name,
        Email: req.body.email,
        Phone: req.body.phone,
        Position: req.body.position,
        Experience: req.body.experience,
        Skills: req.body.skills,
        Real_GPS: req.body.realLocation,
        Shown_to_User: req.body.displayLocation,
        Photo_File: req.files["photo"]?.[0]?.filename || "",
        Audio_File: req.files["audio"]?.[0]?.filename || "",
        Video_File: req.files["video"]?.[0]?.filename || "",
        Date: new Date().toLocaleString()
    };

    saveToExcel(applicant);

    console.log("Applicant Saved:", applicant);

    res.json({ status:"success", id: applicantID });
});

const PORT = process.env.PORT || 3000;

/* ================= HR ADMIN ACCESS ================= */

// simple password protection
const HR_PASSWORD = "panthadip123";

app.use("/hr", (req, res, next) => {
    const pass = req.query.key;
    if(pass === HR_PASSWORD) next();
    else res.send("Unauthorized");
});

app.use("/hr/uploads", express.static(path.join(__dirname, "uploads")));

// download excel
app.get("/hr/download", (req, res) => {
    const file = "applications.xlsx";
    if(fs.existsSync(file))
        res.download(file);
    else
        res.send("No applications yet");
});

// view uploaded files


app.listen(PORT, () => console.log("Server running"));

