const PORT = process.env.PORT || 3000;

console.log("Starting the server...");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST /upload-car → handles both image and car data
app.post("/upload-car", upload.single("image"), (req, res) => {
  const { title, desc, price } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  if (!title || !desc || !price || !image) {
    return res.status(400).json({ message: "All fields required." });
  }

  const newCar = { title, desc, price, image };

  fs.readFile("cars.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading cars.json:", err);
      return res.status(500).json({ error: "Failed to read cars.json" });
    }

    let cars = JSON.parse(data);
    cars.push(newCar);

    fs.writeFile("cars.json", JSON.stringify(cars, null, 2), (err) => {
      if (err) {
        console.error("Error writing to cars.json:", err);
        return res.status(500).json({ error: "Failed to save car" });
      }
      console.log("New car added:", newCar);
      res.status(200).json({ message: "✅ Car added!", car: newCar });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
