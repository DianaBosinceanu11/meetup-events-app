export default function EventCard({ event, user, handleBookEvent }) {
    const availableSpots = event.capacity - (event.booked?.length || 0);
  
    return (
      <li className="event-card">
        <h3>{event.name}</h3>
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Available Spots:</strong> {availableSpots}</p>
  
        {user && availableSpots > 0 ? (
          <button className="btn-primary" onClick={() => handleBookEvent(event.id)}>Book Event</button>
        ) : (
          <p><strong>{availableSpots === 0 ? "Fully Booked!" : "Log in to book!"}</strong></p>
        )}
      </li>
    );
  }
