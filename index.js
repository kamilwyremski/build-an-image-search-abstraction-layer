const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

let imagesData;
let recentSearches = [];

try {
  const rawData = fs.readFileSync('images.json');
  imagesData = JSON.parse(rawData);
} catch (error) {
  console.error('Error reading images.json:', error);
  process.exit(1);
}

try {
  const recentSearchesData = fs.readFileSync('recentSearches.json');
  recentSearches = JSON.parse(recentSearchesData);
} catch (error) {
  console.error('Error reading recentSearches.json:', error);
}

app.get('/', (req, res) => {
  res.send('Image Search Abstraction Layer');
});

app.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const  page = req.query?.page || 1;
  
  const perPage = 10;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = imagesData.filter(i => i.description.includes(query)).slice(startIndex, endIndex);

  recentSearches.unshift({ query, page, timestamp: new Date() });
  if (recentSearches.length > 10) recentSearches.pop();

  fs.writeFile('recentSearches.json', JSON.stringify(recentSearches), (err) => {
    if (err) {
      console.error('Error writing to recentSearches.json:', err);
    }
  });

  res.json(paginatedData);
});

app.get('/recent', (req, res) => {
  res.json(recentSearches);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});