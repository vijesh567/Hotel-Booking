const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb+srv://hotel_booking:hKn0W9Rn6osoDRCH@myatlasclusteredu.kshif.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU";

main()
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// Fitness Tracker Route
app.get("/fitness-tracker", (req, res) => {
  res.render("tracker.ejs"); // Updated to tracker.ejs
});

// Define a Mongoose schema for fitness tracking
const fitnessSchema = new mongoose.Schema({
  pushups: Number,
  pullups: Number,
  jumpingJacks: Number,
  plank: Number,
  timestamp: { type: Date, default: Date.now }
  // You might want to associate this with a user later
});

const FitnessRecord = mongoose.model("FitnessRecord", fitnessSchema);

// Route to handle saving the fitness tracking data
app.post("/fitness-tracker/save", async (req, res) => {
  const { pushups, pullups, jumpingJacks, plank } = req.body;
  const newRecord = new FitnessRecord({
    pushups: parseInt(pushups),
    pullups: parseInt(pullups),
    jumpingJacks: parseInt(jumpingJacks),
    plank: parseInt(plank),
  });

  try {
    await newRecord.save();
    console.log("Fitness data saved!");
    res.redirect("/fitness-tracker"); // Redirect back to the tracker page
  } catch (error) {
    console.error("Error saving fitness data:", error);
    res.send("Error saving data."); // Basic error handling
  }
});

app.listen(8080, () => {
  console.log("🚀 Server is running on port 8080");
});
