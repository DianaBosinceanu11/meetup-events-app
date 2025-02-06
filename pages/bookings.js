import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import MapComponent from "../components/MapComponent";
import styles from "../styles/BookingHistory.module.css";  // Import CSS Module

export default function BookingHistory() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null); // For popup modal
  const [confirmCancel, setConfirmCancel] = useState(null); // For cancel confirmation
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      const querySnapshot = await getDocs(collection(db, "events"));
      const userBookings = querySnapshot.docs
        .filter((doc) => doc.data().booked?.includes(user.uid))
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setBookings(userBookings);
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (eventId) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        booked: arrayRemove(user.uid),
      });

      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== eventId));
      setSelectedBooking(null);
      alert("Booking canceled successfully!");
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Your Bookings</h1>

      {bookings.length > 0 ? (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {bookings.map((booking) => (
              <li key={booking.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px", position: "relative", cursor: "pointer" }} onClick={() => setSelectedBooking(booking)}>
                <h3>{booking.name}</h3>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Location:</strong> {booking.location}</p>

                <button onClick={(e) => { e.stopPropagation(); setConfirmCancel(booking); }} style={{ position: "absolute", right: "10px", top: "10px", backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>
                  Cancel Booking
                </button>
              </li>
            ))}
          </ul>

          <MapComponent events={bookings} hideBookingButton={true} />
        </>
      ) : (
        <p>You haven't booked any events yet.</p>
      )}

      {/* Modal for Event Details */}
      {selectedBooking && (
        <>
          <div className={styles.modal}>
            <h2>{selectedBooking.name}</h2>
            <p><strong>Category:</strong> {selectedBooking.category}</p>
            <p><strong>Location:</strong> {selectedBooking.location}</p>
            <p><strong>Date:</strong> {selectedBooking.date}</p>
            <p><strong>Description:</strong> {selectedBooking.description}</p>

            <button onClick={() => setConfirmCancel(selectedBooking)} className={`${styles.button} ${styles.cancelButton}`}>
              Cancel Booking
            </button>
            <button onClick={() => setSelectedBooking(null)} className={`${styles.button} ${styles.closeButton}`}>
              Close
            </button>
          </div>
          <div className={styles.backdrop} onClick={() => setSelectedBooking(null)}></div>
        </>
      )}

      {/* Confirmation Modal for Cancellation */}
      {confirmCancel && (
        <>
          <div className={styles.modal}>
            <h2>Confirm Cancellation</h2>
            <p><strong>Event:</strong> {confirmCancel.name}</p>
            <p><strong>Date:</strong> {confirmCancel.date}</p>
            <p><strong>Location:</strong> {confirmCancel.location}</p>

            <button onClick={() => { handleCancelBooking(confirmCancel.id); setConfirmCancel(null); }} className={`${styles.button} ${styles.cancelButton}`}>
              Yes, Cancel
            </button>
            <button onClick={() => setConfirmCancel(null)} className={`${styles.button} ${styles.closeButton}`}>
              No, Keep Booking
            </button>
          </div>
          <div className={styles.backdrop} onClick={() => setConfirmCancel(null)}></div>
        </>
      )}
    </div>
  );
}
