const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for images and front-end assets)
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read JSON files
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Helper function to write to JSON files
const writeJsonFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Route to fetch cars from cars-rep.json or cars.json
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

// Admin route to add new car
app.post('/add-car', async (req, res) => {
  const { title, desc, price, image, jsonChoice } = req.body;

  if (!title || !desc || !price || !image || !jsonChoice) {
    return res.status(400).send('Missing required fields');
  }

  const newCar = { title, desc, price, image };

  const filePath = jsonChoice === 'cars-rep.json' ? './cars-rep.json' : './cars.json';

  try {
    const cars = await readJsonFile(filePath);
    cars.push(newCar);
    await writeJsonFile(filePath, cars);
    res.send('Car added successfully');
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin route to view the form for adding cars
app.get('/admin', (req, res) => {
  res.send(`
    <form action="/add-car" method="POST">
      <label for="title">Car Title:</label>
      <input type="text" id="title" name="title" required>
      
      <label for="desc">Car Description:</label>
      <textarea id="desc" name="desc" required></textarea>
      
      <label for="price">Car Price:</label>
      <input type="text" id="price" name="price" required>
      
      <label for="image">Car Image:</label>
      <input type="text" id="image" name="image" required>
      
      <label for="json-choice">Choose where to add the car:</label>
      <select id="json-choice" name="json-choice">
        <option value="cars-rep.json">cars-rep.json</option>
        <option value="cars.json">cars.json</option>
      </select>

      <button type="submit">Add Car</button>
    </form>
  `);
});

// Error handling middleware (for debugging)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
