// components/Navbar.js
import Link from "next/link";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure Firebase is imported
import styles from "../styles/Navbar.module.css"; // Keep existing styles

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(""); // Store user role
  const [loading, setLoading] = useState(true); // Prevent premature rendering

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role);
        }
      }
      setLoading(false); // Mark loading as complete
    };

    if (user) {
      fetchUserRole();
    } else {
      setRole(""); // Reset role if logged out
      setLoading(false);
    }
  }, [user]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">🎉 Meetup Events</Link>
      </div>

      <div className={styles.navLinks}>
        {loading ? ( // Show loading state while fetching user role
          <p>Loading...</p>
        ) : user ? (
          <>
            <span className={styles.welcome}>
              Welcome, {user.displayName || "User"}!
            </span>
            {role === "admin" ? (
              <>
                <Link href="/admin">
                  <button className={styles.navButton}>Admin Dashboard</button>
                </Link>
                <Link href="/add-event">
                  <button className={styles.navButton}>Add Event</button>
                </Link>
              </>
            ) : (
              <Link href="/bookings">
                <button className={styles.navButton}>My Events</button>
              </Link>
            )}
            <button className={styles.logoutButton} onClick={() => auth.signOut()}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signup">
              <button className={styles.navButton}>Sign Up</button>
            </Link>
            <Link href="/login">
              <button className={styles.navButton}>Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
