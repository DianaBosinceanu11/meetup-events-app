import { useEffect, useRef, useState } from "react";
import { db, auth } from "../firebase";
import { updateDoc, arrayUnion, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import "leaflet/dist/leaflet.css";

// Import Leaflet
const L = typeof window !== "undefined" ? require("leaflet") : null;

export default function MapComponent({ events, hideBookingButton }) {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (typeof window === "undefined" || !L) return;

    // Initialize the map
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([51.505, -0.09], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 10);
            }
          }, 500);
        },
        () => {
          console.warn("Geolocation permission denied or unavailable.");
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !L) return;
  
    // Remove old markers
    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  
    const newMarkers = [];
  
    events.forEach((event) => {
      if (event.locationLat && event.locationLng) {
        // ✅ Define Custom Arrow Icon
        const customIcon = L.icon({
          iconUrl: "/arrow-marker.png", // Make sure this is in /public folder
          iconSize: [32, 32], // Adjust size of icon
          iconAnchor: [16, 32], // Aligns the icon properly
          popupAnchor: [0, -32], // Ensures popups are positioned correctly
        });
  
        // ✅ Add Marker with Custom Icon
        const marker = L.marker([event.locationLat, event.locationLng], {
          icon: customIcon, // Use custom arrow marker
        }).addTo(mapRef.current);
  
        newMarkers.push(marker);
  
        let popupContent = `
          <b>${event.name}</b><br>
          ${event.date}<br>
          ${event.location}
        `;
  
        if (!hideBookingButton && user) {
          popupContent += `
            <br><button id="book-${event.id}" 
              style="margin-top:5px; padding:5px 10px; background-color:#007BFF; color:white; border:none; border-radius:5px; cursor:pointer;">
              Book Event
            </button>
          `;
        } else if (!user) {
          popupContent += `<br><i>Login to book this event</i>`;
        }
  
        marker.bindPopup(popupContent);
  
        marker.on("popupopen", () => {
          setTimeout(() => {
            const bookButton = document.getElementById(`book-${event.id}`);
            if (bookButton) {
              bookButton.addEventListener("click", () => handleBookEvent(event.id));
            }
          }, 100);
        });
  
        marker.on("click", () => {
          mapRef.current.setView([event.locationLat, event.locationLng], 14);
        });
      }
    });
  
    setMarkers(newMarkers);
  }, [events, mapRef.current]);
  

  const handleBookEvent = async (eventId) => {
    if (!user) {
      alert("Please log in to book an event.");
      return;
    }

    try {
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        const eventData = eventDoc.data();

        if (eventData.booked && eventData.booked.includes(user.uid)) {
          alert("You are already booked for this event!");
          return;
        }

        if (eventData.capacity > (eventData.booked?.length || 0)) {
          await updateDoc(eventRef, { booked: arrayUnion(user.uid) });
          alert("Event booked successfully!");
        } else {
          alert("Sorry, no spots available.");
        }
      }
    } catch (error) {
      console.error("Error booking event:", error);
      alert("Something went wrong while booking the event.");
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "20px 0" }}>Event Map</h2>
      <div id="map" style={{ height: "400px", width: "80%", margin: "0 auto", borderRadius: "10px", border: "2px solid #000" }}></div>
    </div>
  );
}
