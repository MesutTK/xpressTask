const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const mongoUri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Example schema for the countries
const countrySchema = new mongoose.Schema({
  name: String,
  region: String,
});

const Country = mongoose.model('Country', countrySchema);

// Endpoint 1: Countries
app.get('/countries', async (req, res) => {
  try {
    const { region } = req.query;

    let query = {};
    if (region) {
      query = { region };
    }

    const countries = await Country.find(query);

    res.json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint 2: Salesrep
app.get('/salesrep', async (req, res) => {
  try {
    // Send a GET request to the /countries endpoint
    const response = await fetch('http://127.0.0.1:3000/countries');
    const countries = await response.json();

    // Perform the necessary analysis to determine sales representative requirements

    // Assume regions is an array containing all unique regions from the countries
    const regions = [...new Set(countries.map(country => country.region))];

    const salesRepRequirements = regions.map(region => {
      const regionCountries = countries.filter(country => country.region === region);
      const countryCount = regionCountries.length;

      const minSalesReq = Math.ceil(countryCount / 7); // Minimum 1 rep per 7 countries
      const maxSalesReq = Math.ceil(countryCount / 3); // Maximum 1 rep per 3 countries

      return {
        region,
        minSalesReq,
        maxSalesReq,
      };
    });

    res.json(salesRepRequirements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});