import React, { useState } from "react";
import axios from "axios";
import "./createRoom.scss";
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [roomName, setRoomName] = useState("");
  const [roomSize, setRoomSize] = useState("2");
  const [coins, setCoins] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomName || !coins) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        API_BASE_URL+"/room/create/new",
        {
          roomName,
          roomSize,
          numberOfCoinsToJoinRoom: parseInt(coins),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "00") {
        setMessage("Room created successfully!");
        setRoomName("");
        setRoomSize("2");
        setCoins("");
        navigate(`/room/${response.data.data.id}`);
      } else {
        setMessage("Failed to create room.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error creating room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createRoomPage">
      <div className="createRoomBox">
        <h1 className="title">Create Game Room</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Room Name:
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </label>

          <label>
            Room Size:
            <div className="radioGroup">
              <label>
                <input
                  type="radio"
                  value="2"
                  checked={roomSize === "2"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                2 Players
              </label>
              <label>
                <input
                  type="radio"
                  value="3"
                  checked={roomSize === "3"}
                  onChange={(e) => setRoomSize(e.target.value)}
                />
                3 Players
              </label>
            </div>
          </label>

          <label>
            Coins to Join:
            <input
              type="number"
              placeholder="Cost of coins to create / join room"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="createBtn" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>

          {message && <p className="formMessage">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
