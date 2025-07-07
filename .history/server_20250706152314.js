const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images, frontend assets)
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/\s+/g, '_').replace(ext, '');
    cb(null, `${timestamp}_${safeName}${ext}`);
  }
});
const upload = multer({ storage });

// Utility: Read JSON file with fallback
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code === 'ENOENT') return resolve([]);
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data || '[]'));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

// Utility: Write JSON file
const writeJsonFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// 🔍 GET /cars — fetch cars from selected JSON file
app.get('/cars', async (req, res) => {
  const filePath = req.query.file === 'cars-rep.json' ? './cars-rep.json' : './cars.json';
  try {
    const cars = await readJsonFile(filePath);
    res.json(cars);
  } catch (error) {
    console.error('Error reading cars file:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ➕ POST /add-car — add a new car with image upload
app.post('/add-car', upload.single('imageFile'), async (req, res) => {
  const { title, desc, price, jsonChoice } = req.body;
  const imageFile = req.file;

  if (!title || !desc || !price || !jsonChoice || !imageFile) {
    return res.status(400).send('❌ Missing required fields or image.');
  }

  const imagePath = `/uploads/${imageFile.filename}`;
  const newCar = { title, desc, price, image: imagePath };
  const filePath = jsonChoice === 'cars-rep.json' ? './cars-rep.json' : './cars.json';

  try {
    const cars = await readJsonFile(filePath);
    cars.push(newCar);
    await writeJsonFile(filePath, cars);
    res.send('✅ Car added successfully with image.');
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 🛠 GET /admin — HTML form for adding cars with file upload
app.get('/admin', (req, res) => {
  res.send(`
    <form action="/add-car" method="POST" enctype="multipart/form-data">
      <label for="title">Car Title:</label>
      <input type="text" id="title" name="title" required><br>

      <label for="desc">Car Description:</label>
      <textarea id="desc" name="desc" required></textarea><br>

      <label for="price">Car Price:</label>
      <input type="text" id="price" name="price" required><br>

      <label for="imageFile">Upload Image:</label>
      <input type="file" id="imageFile" name="imageFile" accept="image/*" required><br>

      <label for="json-choice">Choose JSON file:</label>
      <select id="json-choice" name="jsonChoice">
        <option value="cars-rep.json">cars-rep.json</option>
        <option value="cars.json">cars.json</option>
      </select><br><br>

      <button type="submit">Add Car</button>
    </form>
  `);
});

//  Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).send('Internal Server Error');
});

//  Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});