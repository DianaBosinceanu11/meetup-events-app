import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";

export default function EditEvent() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { id } = router.query;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEventData({
            ...data,
            locationLat: data.locationLat || 51.505,
            locationLng: data.locationLng || -0.09,
          });
          setLoading(false);
        } else {
          alert("Event not found!");
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return; // Prevent SSR issues
    if (!eventData || !eventData.locationLat || !eventData.locationLng) return;

    const mapContainer = document.getElementById("locationMap");
    if (!mapContainer) return; // 🚨 Ensure the div exists

    // Prevents duplicate maps
    if (map) return;

    // Initialize map (only once)
    const newMap = L.map(mapContainer).setView(
      [eventData.locationLat, eventData.locationLng],
      10
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(newMap);

    const newMarker = L.marker(
      [eventData.locationLat, eventData.locationLng],
      { draggable: true }
    ).addTo(newMap);

    newMarker.on("dragend", function (e) {
      const { lat, lng } = e.target.getLatLng();
      setEventData((prev) => ({ ...prev, locationLat: lat, locationLng: lng }));
    });

    setMap(newMap);
    setMarker(newMarker);

    // Ensure map resizes correctly
    setTimeout(() => {
      newMap.invalidateSize();
    }, 500);
  }, [eventData]);

  useEffect(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 10);

          if (marker) {
            marker.setLatLng([latitude, longitude]).bindPopup("Your Location").openPopup();
          }

          setEventData((prev) => ({
            ...prev,
            locationLat: latitude,
            locationLng: longitude,
          }));
        },
        () => {
          console.warn("Geolocation permission denied or unavailable.");
        }
      );
    }
  }, [map, marker]);

  const handleLocationSearch = async (e) => {
    const query = e.target.value.trim();
    if (!query) return;

    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query });

    if (results.length === 0) {
      alert("Location not found. Try another search term.");
      return;
    }

    const { x: lng, y: lat, label } = results[0];

    setEventData((prev) => ({
      ...prev,
      location: label,
      locationLat: lat,
      locationLng: lng,
    }));

    setTimeout(() => {
      if (map && marker) {
        map.setView([lat, lng], 13);
        marker.setLatLng([lat, lng]).bindPopup(label).openPopup();
      }
    }, 500);
  };

  const handleUpdateEvent = async () => {
    if (!eventData.name || !eventData.category || !eventData.location || !eventData.date || !eventData.description) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      await updateDoc(doc(db, "events", id), eventData);
      alert("Event updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event.");
    }
  };

  if (loading) return <p>Loading event details...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Edit Event</h1>

      <input
        type="text"
        placeholder="Event Name"
        value={eventData.name || ""}
        onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
      />
      <br />

      <input
        type="text"
        placeholder="Category"
        value={eventData.category || ""}
        onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
      />
      <br />

      <input type="text" placeholder="Search for Location" onBlur={handleLocationSearch} />
      <br />

      <input
        type="text"
        placeholder="Location"
        value={eventData.location || ""}
        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
      />
      <br />

      <input
        type="date"
        value={eventData.date || ""}
        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
      />
      <br />

      <textarea
        placeholder="Description"
        value={eventData.description || ""}
        onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
      />
      <br />

      <h3>Update Location</h3>
      <p>Search for a location or drag the marker to update</p>
      <div id="locationMap" style={{ height: "300px", width: "80%", margin: "0 auto" }}></div>

      <br />

      <button onClick={handleUpdateEvent}>Update Event</button>
    </div>
  );
}
