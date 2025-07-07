import React, { useState, useEffect } from 'react';
import "./profile.scss";
import axios from 'axios';

const Profile = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_BASE_URL+'/player/info', {
          headers: {
             Authorization: `Bearer ${token}`,
          }
        });
        
        setPlayerData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  const getLevelEmoji = (level) => {
    switch(level.toLowerCase()) {
      case 'newbie':
        return '👶'; // Baby emoji
      case 'pro':
        return '🥷'; // Ninja emoji
      case 'master':
        return '🏅'; // Gold medal emoji
      default:
        return '🏆'; // Default trophy
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="profile-container">
        <div className="no-data">No player data available</div>
      </div>
    );
  }

  const userStats = [
    { label: "Wealth", value: playerData.numberOfCoins, icon: "💰" },
    { label: "Level", value: playerData.level, icon: getLevelEmoji(playerData.level) },
    { label: "Games Won", value: playerData.gamesWon, icon: "✅" },
    { label: "Games Lost", value: playerData.gamesLost, icon: "❌" },
  ];

  return (
    <div className='profile-container'>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={playerData.avatar || "https://res.cloudinary.com/datnaqyl0/image/upload/v1743415863/samples/man-portrait.jpg"} 
              alt="User avatar" 
              className="avatar-image"
            />
            <h1 className="username">{playerData.username}</h1>
            <div className="level-badge">
              {playerData.level} {getLevelEmoji(playerData.level)}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="stats-section">
            {userStats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="banker-section">
            <div className="banker-image-container">
                 <div className="speech-bubble">
                {playerData.newUser ? "Hallo new player! I am the banker" : "Buy/Sell coins"}
              </div>
              <img 
                src="https://res.cloudinary.com/datnaqyl0/image/upload/v1749125498/passonApp/gu6qx4bxslnrvnjpuj3z.png" 
                alt="Banker character" 
                className="banker-image"
              />
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;