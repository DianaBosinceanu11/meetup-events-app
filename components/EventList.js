// components/EventList.js
import EventCard from "./EventCard";

export default function EventList({ events, user, handleBookEvent }) {
  return (
    <ul>
      {events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            user={user}
            handleBookEvent={handleBookEvent}
          />
        ))
      ) : (
        <p>No events found.</p>
      )}
    </ul>
  );
}
