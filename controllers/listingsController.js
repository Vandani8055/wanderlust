const Listing = require("../models/listing");
const { geocodeNominatim } = require("../utils/geocode");
const Fuse = require("fuse.js");        //for loose search in search bar 
// const geocode = require("./utils/geocode");
const pluralize = require("pluralize"); // ⬅️ add this      / / for tags search loosly

// render All listings:
// for icons : change will be needed...
// render All listings with tags filter:
module.exports.index = async (req, res) => {
  const { tags } = req.query;

  let filter = {};
  if (tags && tags !== "all") {
    filter = { tags: { $in: [tags.toLowerCase()] } };
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", { allListings, tags: tags || "all" });
};



// New route :
module.exports.renderNewForm = (req, res) => {
  // router.get("/listings/new" , (req, res) => { not use "/" bcz view create above
  res.render("listings/new.ejs");
};




// Show Listhing : (one)
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner"); // Pass data to EJS for specific listing
  if (!listing) {
    req.flash("error", "Listing you requested. Does not exist😬💥!");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    const { title, description, location, price , tags : []} = req.body.listing;
    const geoData = await geocodeNominatim(location);
    console.log("🌍 Geocoded result:", geoData);

    let geometry = { type: "Point", coordinates: [] };
    if (geoData) {
      geometry.coordinates = [geoData.lon, geoData.lat];
    }

    const newListing = new Listing({
      title,
      description,
      location,
      price,
      country,
      geometry,
      owner: req.user._id,
      image: {
        url: req.file?.path || "",
        filename: req.file?.filename || "listingimage",
      },
    });

    if (req.body.tags) {
  req.body.tags = req.body.tags.map(t => t.trim().toLowerCase());
}


    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    req.flash("error", "Failed to create listing — check location name.");
    res.redirect("/listings/new");
  }
};

// render edit form :
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested. Does not exist😬💥!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// update Listing :
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  //edit and not file then give err:
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    if (req.body.tags) {
  req.body.tags = req.body.tags.map(t => t.trim().toLowerCase());
}

    await listing.save();
  }
  req.flash("success", "Listing Updated! 🎉");
  res.redirect(`/listings/${id}`);
};



// Delete listing :
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id, { ...req.body.listing });
  req.flash("success", "Listing Deleted!🎉");
  res.redirect("/listings");
};

module.exports.searchListing = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.redirect("/listings");

    // Get all listings
    const listings = await Listing.find({});

    const fuse = new Fuse(listings, {
      keys: ["title", "description"], // fields you want to search
      threshold: 0.4, // smaller = strict, bigger = loose match
    });

    const result = fuse.search(query);

    const allListings = result.map((r) => r.item);

    res.render("listings/searchResult.ejs", {
      allListings,
      query,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error searching listings");
  }
};
