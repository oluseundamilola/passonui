import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./room.scss";

const Room = () => {
  const { roomID } = useParams();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/room/viewRoom/${roomID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "00") {
          setRoomData(response.data.data);
        } else {
          setError("Room not found or error occurred.");
        }
      } catch (err) {
        console.error("Failed to fetch room:", err);
        setError("An error occurred while loading the room.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomID]);

  if (loading) {
    return <div className="room-container">Loading room...</div>;
  }

  if (error) {
    return <div className="room-container error">{error}</div>;
  }

  return (
    <div className="room-container">
      <h1>Welcome to Room: {roomID}</h1>
      {/* You can show more `roomData` details later */}
    </div>
  );
};

export default Room;
