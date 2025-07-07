import React, { useState, useEffect } from "react";
import axios from "axios";
import "./roomlist.scss";
import { useNavigate } from "react-router-dom";

const RoomList = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null); // For modal
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          API_BASE_URL+"/room/list/rooms",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.status === "00") {
          setRooms(response.data.data);
        } else {
          setError("Failed to fetch room list.");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.roomID.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleJoinClick = (room) => {
    setSelectedRoom(room);
  };

  const handleConfirmJoin = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(
          `${API_BASE_URL}/room/join/${selectedRoom.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.status === "00") {
          navigate(`/room/${selectedRoom.id}`);
        } else {
          setError("Failed to fetch room list.");
        }
      } catch (err) {
        console.error("Error joining rooms:", err);
        setError("Error connecting to server.");
      }

    // You can add POST join logic here
    console.log("Joining room:", selectedRoom.roomID);
    setSelectedRoom(null);
  };

  return (
    <div className="roomList">
      <div className="roomListBox">
        <h1 className="title">Open Game Rooms</h1>

        <input
          type="text"
          className="searchBar"
          placeholder="Search by Room ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="roomsContainer">
          {loading ? (
            <p className="noRooms">Loading rooms...</p>
          ) : error ? (
            <p className="noRooms">{error}</p>
          ) : filteredRooms.length ? (
            filteredRooms.map((room, index) => (
              <div className="roomCard" key={index}>
                <div className="profilePic">
                  <img src={room.ownerProfilePic} alt="owner" />
                </div>
                <div className="roomInfo">
                  <span><strong>ROOM-ID:</strong> {room.roomID}</span>
                  <span><strong>Players:</strong> {room.players}</span>
                  <span><strong>Coins to Join:</strong> {room.numberOfCoinsToJoinRoom}</span>
                </div>
                <button className="joinBtn" onClick={() => handleJoinClick(room)}>Join</button>
              </div>
            ))
          ) : (
            <p className="noRooms">No rooms found</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedRoom && (
        <div className="modalOverlay">
          <div className="modalBox">
            <button className="closeBtn" onClick={() => setSelectedRoom(null)}>×</button>
            <p>
              It will cost you <strong>{selectedRoom.numberOfCoinsToJoinRoom}</strong> coins to join room <strong>{selectedRoom.roomID}</strong>. Are you sure?
            </p>
            <button className="confirmBtn" onClick={handleConfirmJoin}>Yes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
