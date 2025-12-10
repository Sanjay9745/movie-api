const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const port = 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const folderPath = path.join(__dirname, "uploads");

try {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create folder and any necessary parent folders
    console.log(`Folder '${folderPath}' created successfully.`);
  } else {
    console.log(`Folder '${folderPath}' already exists.`);
  }
} catch (err) {
  console.error(`Error checking or creating folder: ${err}`);
}

// 1. Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where files will be saved
    cb(null, "uploads/"); // Ensure 'uploads' folder exists!
  },
  filename: function (req, file, cb) {
    // Create a unique filename (e.g., timestamp + original name)
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 2. Initialize multer with storage options
const upload = multer({ storage: storage });

mongoose
  .connect(process.env.MONGOURI || "mongodb://localhost:27017/moviedb")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    year: Number,
    rating: Number,
    description: { type: String },
    image: String,
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

app.post("/api/movies", upload.single("image"), async (req, res) => {
  const movieData = req.body;
  if (req.file) {
    movieData.image = req.file.path; // Save the file path to the image field
  }
  try {
    const newMovie = new Movie(movieData);
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
