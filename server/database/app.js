/* jshint esversion: 8 */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.raw({ type: '*/*' }));

const reviewsData = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealershipsData = JSON.parse(
    fs.readFileSync('dealerships.json', 'utf8')
);

mongoose.connect('mongodb://mongo_db:27017/', {
    dbName: 'dealershipsDB',
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

(async () => {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviewsData.reviews);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealershipsData.dealerships);
})();

// Home
app.get('/', async (req, res) => {
    res.send('Welcome to the Mongoose API');
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch reviews by dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({
            dealership: req.params.id,
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
    try {
        const dealers = await Dealerships.find({});
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const dealers = await Dealerships.find({
            state: req.params.state,
        });
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const dealer = await Dealerships.findOne({
            id: parseInt(req.params.id, 10),
        });
        res.json(dealer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Insert review
app.post('/insert_review', async (req, res) => {
    try {
        const data = JSON.parse(req.body);
        const documents = await Reviews.find().sort({ id: -1 });
        const newId = documents[0].id + 1;

        const review = new Reviews({
            id: newId,
            name: data.name,
            dealership: data.dealership,
            review: data.review,
            purchase: data.purchase,
            purchase_date: data.purchase_date,
            car_make: data.car_make,
            car_model: data.car_model,
            car_year: data.car_year,
        });

        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
