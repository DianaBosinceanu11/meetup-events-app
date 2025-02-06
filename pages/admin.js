import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; // ✅ FIXED
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";


export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [user] = useAuthState(auth);
  const [role, setRole] = useState("");
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
      
        if (userSnap.exists() && userSnap.data().role === "admin") {
          setRole("admin");
        } else {
          router.push("/"); // Redirect non-admins to home
        }
      };
      
      fetchUserRole();
    } else {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [user]);

  // Fetch all events
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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Admin Dashboard</h1>
      <Link href="/add-event"><button style={{ marginBottom: "20px" }}>Add New Event</button></Link>
      
      <h2>All Events</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
            <h3>{event.name}</h3>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <button onClick={() => router.push(`/edit-event/${event.id}`)} style={{ marginRight: "10px" }}>Edit</button>
            <button onClick={() => handleDeleteEvent(event.id)} style={{ backgroundColor: "red", color: "white" }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Function to handle deleting an event
  async function handleDeleteEvent(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", eventId));
      setEvents(events.filter(event => event.id !== eventId));  // Update UI
      alert("Event deleted successfully!");
    }
  }
}
