import React, { useEffect, useState } from "react";
import axios from "axios";
import "./room.scss";

const Room = () => {
  const [roomData, setRoomData] = useState(null);
  const [currentProfileId, setCurrentProfileId] = useState(null); // Extracted from token

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token"); // Your JWT token
        const roomId = 1; // Can be dynamic

        const response = await axios.get(`http://localhost:8080/api/v1/room/viewRoom/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "00") {
          setRoomData(response.data.data);

          // OPTIONAL: Decode token to get profileId
          const decoded = parseJwt(token);
          setCurrentProfileId(decoded.profileID);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  const renderPlayer = (player, index) => {
    const isCurrentPlayer = player.profileId === currentProfileId;

    return (
      <div key={index} className={`player player-${roomData.playersInRoom.length}-${index}`}>
        <div className="profile-circle">
          <img
            src={`https://ui-avatars.com/api/?name=${player.username}`}
            alt={player.username}
          />
          <p>{player.username}</p>
        </div>

        {isCurrentPlayer && (
          <div className="private-actions">
            <button className="suspect-btn">
              Suspects: {player.numberOfSuspect ?? "?"}
            </button>
            <button className="cashout-btn">Cash Out Now</button>
          </div>
        )}
      </div>
    );
  };

  if (!roomData) {
    return <div className="room-container">Loading room...</div>;
  }

  return (
    <div className="room-container">
      <div className="main-circle">
        {roomData.playersInRoom.map((player, index) => renderPlayer(player, index))}
      </div>
    </div>
  );
};

export default Room;
