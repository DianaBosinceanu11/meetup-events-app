import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";

const L = typeof window !== "undefined" ? require("leaflet") : null;

export default function EventForm({ isEdit = false }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { id } = router.query;

  const [eventData, setEventData] = useState({
    name: "",
    category: "",
    location: "",
    date: "",
    description: "",
    capacity: 10,
    locationLat: 51.505, // Default to London
    locationLng: -0.09,
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  // Fetch event data if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchEvent = async () => {
        const eventRef = doc(db, "events", id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          setEventData(eventDoc.data());
        } else {
          alert("Event not found!");
          router.push("/admin");
        }
      };
      fetchEvent();
    }
  }, [id, isEdit]);

  // Initialize Map
  useEffect(() => {
    if (!L) return;

    if (L.DomUtil.get("eventMap") !== null) {
      L.DomUtil.get("eventMap")._leaflet_id = null;
    }

    const newMap = L.map("eventMap").setView(
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

    return () => {
      newMap.remove();
    };
  }, [eventData.locationLat, eventData.locationLng]);

  // Handle location search
  const handleLocationSearch = async (query) => {
    if (!query) return;

    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query });

    if (results.length > 0) {
      const { x: lng, y: lat, label } = results[0];
      setEventData({ ...eventData, location: label, locationLat: lat, locationLng: lng });

      if (marker) {
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 13);
      }
    }
  };

  // Handle event submit
  const handleSubmit = async () => {
    if (!eventData.name || !eventData.category || !eventData.location || !eventData.date || !eventData.description) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      if (isEdit) {
        await updateDoc(doc(db, "events", id), eventData);
        alert("Event updated successfully!");
      } else {
        await addDoc(collection(db, "events"), eventData);
        alert("Event added successfully!");
      }

      router.push("/admin");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{isEdit ? "Edit Event" : "Add New Event"}</h1>

      <input
        type="text"
        placeholder="Event Name"
        value={eventData.name}
        onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <input
        type="text"
        placeholder="Category"
        value={eventData.category}
        onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <input
        type="text"
        placeholder="Search Location"
        onBlur={(e) => handleLocationSearch(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <input
        type="text"
        placeholder="Location"
        value={eventData.location}
        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <input
        type="date"
        value={eventData.date}
        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <textarea
        placeholder="Description"
        value={eventData.description}
        onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
        style={{ padding: "10px", margin: "10px", width: "300px", height: "100px" }}
      />
      <br />

      <input
        type="number"
        placeholder="Capacity"
        value={eventData.capacity}
        onChange={(e) => setEventData({ ...eventData, capacity: Number(e.target.value) })}
        style={{ padding: "10px", margin: "10px", width: "300px" }}
      />
      <br />

      <h3>Update Location</h3>
      <p>Search for a location or drag the marker to update</p>
      <div id="eventMap" style={{ height: "300px", width: "80%", margin: "0 auto", borderRadius: "10px", border: "2px solid #000" }}></div>

      <button onClick={handleSubmit} style={{ padding: "10px 20px", marginTop: "20px" }}>
        {isEdit ? "Update Event" : "Add Event"}
      </button>
    </div>
  );
}
