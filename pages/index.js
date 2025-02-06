import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import SearchBar from "../components/SearchBar";
import EventList from "../components/EventList";
import MapComponent from "../components/MapComponent";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  const [user] = useAuthState(auth);

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
          alert("You have already booked this event.");
          return;
        }

        if (eventData.capacity > (eventData.booked?.length || 0)) {
          await updateDoc(eventRef, { booked: arrayUnion(user.uid) });
          alert("Event booked successfully!");

          const querySnapshot = await getDocs(collection(db, "events"));
          const eventList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(eventList);
        } else {
          alert("Sorry, no spots available.");
        }
      }
    } catch (error) {
      console.error("Error booking event:", error);
      alert("Something went wrong while booking the event.");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    event.category.toLowerCase().includes(search.trim().toLowerCase()) ||
    event.location.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="main-content">
      <h1>Meetup & Events</h1>



      <div className="banner">
        <img src="/banner.jpg" alt="Event Banner" className="banner-img" />
      </div>


      <SearchBar search={search} setSearch={setSearch} />
      <EventList events={filteredEvents} user={user} handleBookEvent={handleBookEvent} />

      <MapComponent events={filteredEvents} />
    </div>
  );
}
