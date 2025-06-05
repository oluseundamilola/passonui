import React from "react";
import "./home.scss";
import { Crown } from "lucide-react";

const Home = () => {
  return (
    <div className="home-container">
      <div className="left-panel">
        <h2 className="leaderboard-title">🏆 Top Players</h2>
        <ul className="leaderboard">
          <li className="player top-player">
            <Crown className="crown-icon" size={24} />
            <span className="player-name">KingDami</span>
          </li>
          <li className="player">
            <span className="player-name">ShadowBoi</span>
          </li>
          <li className="player">
            <span className="player-name">NovaBlitz</span>
          </li>
        </ul>
      </div>
      <div className="right-panel">
        <button className="game-button join">Play: Join a Room</button>
        <button className="game-button create">Create a Room</button>
      </div>
    </div>
  );
};

export default Home;
