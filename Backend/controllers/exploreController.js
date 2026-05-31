import Post from "../models/Post.js";
import axios from "axios";

const cache = new Map();

const CACHE_TTL = {
  news:    15 * 60 * 1000,
  places:  60 * 60 * 1000,
  weather: 30 * 60 * 1000,
  events:  60 * 60 * 1000,
};

const PLACE_CATEGORY_PRIORITY = {
  heritage: 1,
  monument: 2,
  attraction: 3,
  museum: 4,
  viewpoint: 5,
  park: 6,
  temple: 7,
  market: 8,
};

const CURATED_PLACES = {
  bhubaneswar: [
    { name: "Lingaraj Temple", category: "heritage", address: "Old Town, Bhubaneswar", lat: 20.238, lon: 85.833 },
    { name: "Udayagiri and Khandagiri Caves", category: "heritage", address: "Khandagiri, Bhubaneswar", lat: 20.263, lon: 85.785 },
    { name: "Dhauli Shanti Stupa", category: "monument", address: "Dhauli Hills, Bhubaneswar", lat: 20.192, lon: 85.839 },
    { name: "Mukteswara Temple", category: "heritage", address: "Old Town, Bhubaneswar", lat: 20.241, lon: 85.839 },
    { name: "Odisha State Museum", category: "museum", address: "BJB Nagar, Bhubaneswar", lat: 20.259, lon: 85.836 },
    { name: "Nandankanan Zoological Park", category: "attraction", address: "Nandankanan Road, Bhubaneswar", lat: 20.395, lon: 85.817 },
  ],
  delhi: [
    { name: "Red Fort", category: "heritage", address: "Old Delhi", lat: 28.656, lon: 77.241 },
    { name: "Qutub Minar", category: "heritage", address: "Mehrauli, Delhi", lat: 28.524, lon: 77.185 },
    { name: "Humayun's Tomb", category: "heritage", address: "Nizamuddin, Delhi", lat: 28.593, lon: 77.251 },
    { name: "India Gate", category: "monument", address: "Kartavya Path, Delhi", lat: 28.612, lon: 77.229 },
  ],
  mumbai: [
    { name: "Gateway of India", category: "monument", address: "Apollo Bandar, Mumbai", lat: 18.922, lon: 72.834 },
    { name: "Chhatrapati Shivaji Maharaj Terminus", category: "heritage", address: "Fort, Mumbai", lat: 18.94, lon: 72.835 },
    { name: "Elephanta Caves", category: "heritage", address: "Gharapuri, Mumbai Harbour", lat: 18.963, lon: 72.931 },
    { name: "Marine Drive", category: "attraction", address: "South Mumbai", lat: 18.944, lon: 72.823 },
  ],
  kolkata: [
    { name: "Victoria Memorial", category: "heritage", address: "Maidan, Kolkata", lat: 22.545, lon: 88.342 },
    { name: "Howrah Bridge", category: "monument", address: "Kolkata", lat: 22.586, lon: 88.346 },
    { name: "Indian Museum", category: "museum", address: "Park Street Area, Kolkata", lat: 22.558, lon: 88.351 },
    { name: "Dakshineswar Kali Temple", category: "heritage", address: "Dakshineswar, Kolkata", lat: 22.655, lon: 88.358 },
  ],
};

const CURATED_EVENTS = {
  bhubaneswar: [
    { title: "Patha Utsav city street festival", category: "community", venue: "Janpath", labels: ["street festival", "local culture"] },
    { title: "Ekamra Walks heritage trail", category: "community", venue: "Old Town", labels: ["heritage", "walking tour"] },
    { title: "Odissi music and dance performances", category: "concerts", venue: "Rabindra Mandap", labels: ["culture", "performing arts"] },
  ],
};

function getCache(key, ttl) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function fetchPosts(city) {
  return Post.find({ city })
    .populate("user", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(20);
}

async function fetchNews(city) {
  const cacheKey = `news:${city}`;
  const cached = getCache(cacheKey, CACHE_TTL.news);
  if (cached) return cached;
  try {
    const res = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q:        city,
        language: "en",
        sortBy:   "publishedAt",
        pageSize: 6,
        apiKey:   process.env.NEWSAPI_KEY,
      },
      timeout: 5000,
    });
    const data = (res.data.articles || []).map((a) => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      urlToImage:  a.urlToImage,
      source:      a.source?.name,
      publishedAt: a.publishedAt,
    }));
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error("NewsAPI error:", err.message);
    return [];
  }
}

async function fetchWeather(city) {
  const cacheKey = `weather:${city}`;
  const cached = getCache(cacheKey, CACHE_TTL.weather);
  if (cached) return cached;
  try {
    const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q:     city,
        appid: process.env.OPENWEATHER_KEY,
        units: "metric",
      },
      timeout: 5000,
    });
    const d    = res.data;
    const data = {
      temp:        Math.round(d.main.temp),
      feelsLike:   Math.round(d.main.feels_like),
      humidity:    d.main.humidity,
      description: d.weather?.[0]?.description,
      icon:        d.weather?.[0]?.icon,
      windSpeed:   d.wind?.speed,
    };
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error("OpenWeather error:", err.message);
    return null;
  }
}

async function geocodeCity(city) {
  const cacheKey = `geo:${city}`;
  const cached = getCache(cacheKey, CACHE_TTL.places);
  if (cached) return cached;

  const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: `${city}, India`, format: "json", limit: 1 },
    headers: { "User-Agent": "UrbanLoop/1.0 (local discovery app)" },
    timeout: 5000,
  });

  const hit = geoRes.data?.[0];
  if (!hit) return null;

  const data = {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    displayName: hit.display_name,
  };
  setCache(cacheKey, data);
  return data;
}

function normalizePlaceCategory(tags = {}) {
  if (tags.historic === "monument" || tags.memorial) return "monument";
  if (tags.historic || tags.tourism === "heritage") return "heritage";
  if (tags.tourism === "museum" || tags.amenity === "museum") return "museum";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.leisure === "park") return "park";
  if (tags.amenity === "place_of_worship") return "temple";
  if (tags.shop === "mall" || tags.amenity === "marketplace") return "market";
  return tags.tourism || tags.amenity || tags.leisure || tags.shop || "attraction";
}

function curatedPlacesFor(city) {
  return (CURATED_PLACES[city.toLowerCase()] || []).map((place) => ({
    ...place,
    source: "Curated",
  }));
}

async function fetchPlaces(city, geo) {
  const cacheKey = `places:${city}`;
  const cached = getCache(cacheKey, CACHE_TTL.places);
  if (cached) return cached;
  try {
    if (!geo) return curatedPlacesFor(city);
    const { lat, lon } = geo;

    const query = `
      [out:json][timeout:25];
      (
        nwr["tourism"~"^(attraction|museum|viewpoint|gallery|theme_park|zoo)$"](around:18000,${lat},${lon});
        nwr["historic"](around:18000,${lat},${lon});
        nwr["heritage"](around:18000,${lat},${lon});
        nwr["memorial"](around:18000,${lat},${lon});
        nwr["leisure"="park"](around:12000,${lat},${lon});
        nwr["amenity"="place_of_worship"](around:12000,${lat},${lon});
        nwr["amenity"="marketplace"](around:10000,${lat},${lon});
      );
      out center tags 80;
    `;

    const placesRes = await axios.get("https://overpass-api.de/api/interpreter", {
      params: { data: query },
      timeout: 15000,
    });

    const osmPlaces = (placesRes.data.elements || [])
      .filter((p) => p.tags?.name)
      .map((p) => ({
        name:     p.tags.name,
        category: normalizePlaceCategory(p.tags),
        address:  [p.tags["addr:street"], p.tags["addr:city"]]
                    .filter(Boolean).join(", ") || city,
        lat:      p.lat || p.center?.lat,
        lon:      p.lon || p.center?.lon,
        source:   "OpenStreetMap",
      }))
      .filter((p) => p.lat && p.lon)
      .filter((p, i, self) => i === self.findIndex((t) => t.name === p.name))
      .sort((a, b) => (PLACE_CATEGORY_PRIORITY[a.category] || 99) - (PLACE_CATEGORY_PRIORITY[b.category] || 99));

    const data = [...curatedPlacesFor(city), ...osmPlaces]
      .filter((p, i, self) => i === self.findIndex((t) => t.name.toLowerCase() === p.name.toLowerCase()))
      .slice(0, 40);

    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error("Places error:", err.message);
    return curatedPlacesFor(city);
  }
}

function fallbackEvents(city) {
  const curated = CURATED_EVENTS[city.toLowerCase()] || [
    { title: `${city} cultural and community meetups`, category: "community", venue: city, labels: ["community", "local"] },
    { title: `${city} live music and performances`, category: "concerts", venue: city, labels: ["music", "arts"] },
    { title: `${city} exhibitions and public events`, category: "expos", venue: city, labels: ["exhibition", "upcoming"] },
  ];
  const now = Date.now();
  return curated.map((event, index) => ({
    ...event,
    start: new Date(now + (index + 2) * 24 * 60 * 60 * 1000).toISOString(),
    end: null,
    isFallback: true,
  }));
}

async function fetchEvents(city, geo) {
  const cacheKey = `events:${city}`;
  const cached = getCache(cacheKey, CACHE_TTL.events);
  if (cached) return cached;
  try {
    const params = {
      q:        city,
      country:  "IN",
      limit:    20,
      sort:     "start",
      state:    "active",
      category: "concerts,festivals,sports,expos,conferences,community,performing-arts",
      "start.gte": new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      "start.lte": new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    };
    if (geo) params.within = `30km@${geo.lat},${geo.lon}`;

    const res = await axios.get("https://api.predicthq.com/v1/events/", {
      params,
      headers: {
        Authorization: `Bearer ${process.env.PREDICTHQ_KEY}`,
        Accept:        "application/json",
      },
      timeout: 5000,
    });
    const seen = new Set();
    const data = (res.data.results || [])
      .filter((e) => {
        if (seen.has(e.title)) return false;
        seen.add(e.title);
        return true;
      })
      .slice(0, 6)
      .map((e) => ({
        title:    e.title,
        category: e.category,
        start:    e.start,
        end:      e.end,
        labels:   e.labels,
        venue:    e.entities?.[0]?.name || city,
        source:   "PredictHQ",
      }));
    const dataWithFallback = data.length ? data : fallbackEvents(city);
    setCache(cacheKey, dataWithFallback);
    return dataWithFallback;
  } catch (err) {
    console.error("PredictHQ error:", err.response?.data || err.message);
    return fallbackEvents(city);
  }
}

export const getExploreData = async (req, res) => {
  const city = req.params.city.trim();
  if (!city) return res.status(400).json({ message: "City is required" });
  try {
    const geo = await geocodeCity(city).catch((err) => {
      console.error("Geocode error:", err.message);
      return null;
    });
    const [news, places, weather, events] = await Promise.all([
      fetchNews(city),
      fetchPlaces(city, geo),
      fetchWeather(city),
      fetchEvents(city, geo),
    ]);
    res.json({ city, news, places, weather, events });
  } catch (err) {
    console.error("EXPLORE ERROR:", err);
    res.status(500).json({ message: "Failed to load explore data" });
  }
};
