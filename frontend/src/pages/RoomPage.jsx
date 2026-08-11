import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/rooms')
      .then(setRooms)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>{room.name} — capacity {room.capacity}</li>
        ))}
      </ul>
    </div>
  );
}

export default RoomPage;