import React, { useEffect, useState } from "react";
import "./home.scss";
import { Crown } from "lucide-react";
import Welcome from "../welcome/Welcome";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [playerData, setPlayerData] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:8080/api/v1/player/info', {
          headers: {
             Authorization: `Bearer ${token}`,
          }
        });
        
        setPlayerData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch player info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

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

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return (
    <div className="home-container">
      <div className="profile">
        <div className="pic">
          <Link to="/profile">
            {/* Fallback avatar or null check */}
            <img 
              src={playerData?.avatar || "https://via.placeholder.com/150"} 
              className="picture"
              alt="Player avatar"
            />
          </Link>
        </div>
        <div className="wealth">
          <p>{playerData?.numberOfCoins || 0}🪙</p>
        </div>
      </div>

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
          <Link to="/roomlist"><button className="game-button join">Play: Join a Room</button></Link>
          <Link><button className="game-button create">Create a Room</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;