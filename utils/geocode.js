const fetch = global.fetch || require("node-fetch");

async function geocodeNominatim(location) {
  if (!location) throw new Error("No location provided");

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    location
  )}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "WanderlustApp/1.0" }, // Required by OSM policy
    });
    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn("⚠️ No geocoding result for:", location);
      return null; // Return null instead of throwing
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (err) {
    console.error("❌ Geocoding error:", err.message);
    return null;
  }
}

module.exports = { geocodeNominatim };
