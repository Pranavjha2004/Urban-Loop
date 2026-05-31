import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, MapPin, CalendarDays,
  Wind, Droplets, X,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";
import FloatingNav from "../components/FloatingNav";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TABS = [
  { id: "news",   label: "News",   icon: Newspaper },
  { id: "places", label: "Places", icon: MapPin },
  { id: "events", label: "Events", icon: CalendarDays },
];

const CATEGORY_COLORS = {
  heritage:   "text-amber-300  bg-amber-300/10  border-amber-300/20",
  monument:   "text-stone-300  bg-stone-300/10  border-stone-300/20",
  attraction: "text-teal-300   bg-teal-300/10   border-teal-300/20",
  viewpoint:  "text-sky-300    bg-sky-300/10    border-sky-300/20",
  temple:     "text-rose-300   bg-rose-300/10   border-rose-300/20",
  market:     "text-lime-300   bg-lime-300/10   border-lime-300/20",
  restaurant: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  cafe:       "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  cinema:     "text-blue-400   bg-blue-400/10   border-blue-400/20",
  hospital:   "text-red-400    bg-red-400/10    border-red-400/20",
  museum:     "text-purple-400 bg-purple-400/10 border-purple-400/20",
  park:       "text-green-400  bg-green-400/10  border-green-400/20",
  bar:        "text-pink-400   bg-pink-400/10   border-pink-400/20",
  mall:       "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};

const CATEGORY_ICONS = {
  heritage: "H", monument: "M", attraction: "A", viewpoint: "V", temple: "T", market: "B",
  restaurant: "🍽️", cafe: "☕",  cinema: "🎬",
  hospital:   "🏥", museum: "🏛️", park:  "🌳",
  bar:        "🍸", mall:  "🛍️",
};

const PLACE_FILTERS = ["all", "heritage", "monument", "attraction", "museum", "viewpoint", "park", "temple", "market"];

const EVENT_COLORS = {
  festivals:   "text-pink-400   bg-pink-400/10   border-pink-400/20",
  concerts:    "text-purple-400 bg-purple-400/10 border-purple-400/20",
  sports:      "text-green-400  bg-green-400/10  border-green-400/20",
  expos:       "text-blue-400   bg-blue-400/10   border-blue-400/20",
  conferences: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  community:   "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

const EVENT_ICONS = {
  festivals: "🎪", concerts: "🎵", sports:      "🏆",
  expos:     "🏛️", conferences: "🎤", community: "🤝",
};

export default function Explore() {
  const { city } = useParams();

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [tab,           setTab]           = useState("news");
  const [placeSearch,   setPlaceSearch]   = useState("");
  const [placeCategory, setPlaceCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation,  setUserLocation]  = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    API.get(`/explore/${city}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError("Could not load explore data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => {
    if (!selectedPlace) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()    => setUserLocation(null)
    );
  }, [selectedPlace]);

  const openDirections = (place) => {
    const dest   = `${place.lat},${place.lon}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : "";
    const url    = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, "_blank");
  };

  return (
    <div className="urban-shell">
      <FloatingNav />

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pt-24 sm:pt-28 pb-16">

        {/* ── Header ── */}
        <div className="mb-8 urban-surface rounded-3xl p-4 sm:p-6 urban-appear">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white capitalize">{city}</h1>
          {data?.weather && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-zinc-400">
              <img
                src={`https://openweathermap.org/img/wn/${data.weather.icon}.png`}
                alt={data.weather.description}
                className="w-8 h-8"
              />
              <span className="text-white font-medium">{data.weather.temp}°C</span>
              <span className="capitalize">{data.weather.description}</span>
              <span className="text-zinc-600">·</span>
              <Droplets size={14} /><span>{data.weather.humidity}%</span>
              <span className="text-zinc-600">·</span>
              <Wind size={14} /><span>{data.weather.windSpeed} m/s</span>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                whitespace-nowrap transition-all
                ${tab === id
                  ? "urban-pill"
                  : "urban-surface text-zinc-400 hover:text-white"
                }`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && data && (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── NEWS ── */}
            {tab === "news" && (
              <div className="space-y-3">
                {data.news.length === 0 && <Empty text="No news found for this city." />}
                {data.news.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer"
                    className="flex gap-3 urban-card rounded-2xl p-4">
                    {article.urlToImage && (
                      <img src={article.urlToImage} alt="" className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-2">{article.title}</p>
                      <p className="text-zinc-500 text-xs mt-1">{article.source} · {new Date(article.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* ── PLACES ── */}
            {tab === "places" && (
              <div>
                <div className="relative mb-4">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search places..."
                    value={placeSearch}
                    onChange={(e) => setPlaceSearch(e.target.value)}
                    className="w-full urban-input rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-zinc-600"
                  />
                </div>

                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                  {PLACE_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPlaceCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all capitalize
                        ${placeCategory === cat ? "urban-pill" : "urban-surface text-zinc-400 hover:text-white"}`}
                    >
                      {cat === "all" ? "Must Visit" : cat}
                    </button>
                  ))}
                </div>

                {(() => {
                  const filtered = data.places.filter((p) => {
                    const matchesSearch   = p.name.toLowerCase().includes(placeSearch.toLowerCase());
                    const matchesCategory = placeCategory === "all" || p.category === placeCategory;
                    return matchesSearch && matchesCategory;
                  });
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filtered.length === 0 && (
                        <div className="col-span-2"><Empty text="No places match your search." /></div>
                      )}
                      {filtered.map((place, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedPlace(place)}
                          className="urban-card rounded-2xl p-5 flex flex-col min-h-[160px] cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-black text-zinc-200">
                              {CATEGORY_ICONS[place.category] || "📍"}
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${CATEGORY_COLORS[place.category] || "text-purple-400 bg-purple-400/10 border-purple-400/20"}`}>
                              {place.category}
                            </span>
                          </div>
                          <p className="text-white font-semibold text-base leading-snug mb-2">{place.name}</p>
                          <div className="flex items-start gap-1.5 mt-auto">
                            <MapPin size={12} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                            <p className="text-zinc-500 text-xs line-clamp-2">{place.address || city}</p>
                          </div>
                          {place.source && (
                            <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-600">{place.source}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── EVENTS ── */}
            {tab === "events" && (
              <div className="space-y-4">
                {data.events.length === 0 && <Empty text="No upcoming events found." />}
                {data.events.map((event, i) => {
                  const startDate = new Date(event.start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  const endDate   = event.end ? new Date(event.end).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
                  return (
                    <div key={i} className="urban-card rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">
                          {EVENT_ICONS[event.category] || "📅"}
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${EVENT_COLORS[event.category] || "text-purple-400 bg-purple-400/10 border-purple-400/20"}`}>
                          {event.category}
                        </span>
                      </div>
                      <p className="text-white font-bold text-base leading-snug mb-3">{event.title}</p>
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <CalendarDays size={14} className="flex-shrink-0" />
                        <span>{startDate}{endDate && ` – ${endDate}`}</span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-2">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.isFallback && (
                        <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-600">
                          Suggested local discovery
                        </p>
                      )}
                      {event.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {event.labels.slice(0, 4).map((l) => (
                            <span key={l} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full capitalize">{l}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </motion.div>
        )}
      </div>

      {/* ── Map Modal ── */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedPlace(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg urban-surface rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-white font-bold text-base">{selectedPlace.name}</h3>
                  <p className="text-zinc-500 text-xs capitalize mt-0.5">
                    {selectedPlace.category} · {selectedPlace.address}
                  </p>
                </div>
                <button onClick={() => setSelectedPlace(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {selectedPlace.lat && selectedPlace.lon ? (
                <div className="h-64 w-full">
                  <MapContainer
                    center={[selectedPlace.lat, selectedPlace.lon]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                    />
                    <Marker position={[selectedPlace.lat, selectedPlace.lon]}>
                      <Popup>{selectedPlace.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">
                  Map not available for this place
                </div>
              )}

              <div className="px-5 py-4">
                <button
                  onClick={() => openDirections(selectedPlace)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                    urban-pill text-sm font-semibold transition-all"
                >
                  <MapPin size={16} />
                  Get Directions on Google Maps
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-center py-16 text-zinc-600 text-sm">{text}</div>;
}
