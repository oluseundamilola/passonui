import React, { useEffect, useState } from "react";
import "./home.scss";
import { Crown } from "lucide-react";
import Welcome from "../welcome/Welcome";
import axios from "axios";

const Home = () => {
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/v1/player/top", {
        headers: {
            Authorization: `Bearer ${token}`,
          },
      })
      .then((res) => {
        setTopPlayers(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch top players", err);
      });
  }, []);

  return (
    <div className="home-container">
      <div className="profile"></div>

      <div className="left-panel">
        <div className="center">
          <div className="top">
            <h1>Top Players</h1>
          </div>
          <div className="down">
            <div className="players">
              {topPlayers.map((player, index) => (
                <p
                  key={player.profileId}
                  className={`player-name rank-${index + 1}`}
                >
                  {player.username} {player.coins}🪙
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="buttoncase">
          <button className="game-button join">Play: Join a Room</button>
          <button className="game-button create">Create a Room</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
