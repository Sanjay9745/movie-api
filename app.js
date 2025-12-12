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

app.delete('/api/movies/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Find the file record in your database using the ID
    // Example: const fileRecord = await FileModel.findById(fileId);
    // if (!fileRecord) return res.status(404).send('File not found');

    const filePath = fileRecord.path; // Assuming your model has a 'path' field

    // ... proceed to Step 3 and 4
  } catch (error) {
    res.status(500).send('Error deleting file record');
  }
});

app.put('/api/movies/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year,rating,description } = req.body;
    const updateData = await Movie.findById(id);
    if (!updateData) {
      return res.status(404).json({ error: 'Movie not found' });
    } 

    // Build update object
  // Start with existing data
   
    if (req.file) {
      updateData.image = req.file.path; // Update profile picture path if a new file is uploaded
    }
 if (rating) {
      updateData.rating = rating; // Update profile picture path if a new file is uploaded
    }

    if (name) {
      updateData.name= name; // Update profile picture path if a new file is uploaded
    }

    if (year) {
      updateData.year = year; // Update profile picture path if a new file is uploaded
    }
    if (description) {
      updateData.description = description; // Update profile picture path if a new file is uploaded
    }
    
    await updateData.save();
   

   
    res.status(200).json(updateData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
