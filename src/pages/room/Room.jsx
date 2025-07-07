import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./room.scss";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  width: 100%;  
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

const Room = () => {
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const WS_URL = "http://localhost:8080/ws";

  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const userVideo = useRef();
  const partnerVideo = useRef();


  const { roomID: roomId } = useParams();

  const token = localStorage.getItem("token");


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
      })
      .catch((err) => {
        console.error("Failed to get media stream:", err);
      });
  }, []);


  // 🎯 Attach stream to video ref when available
  useEffect(() => {
    if (stream && userVideo.current) {
      userVideo.current.srcObject = stream;
    }
  }, [stream]);


    // Initialize WebSocket connection
  useEffect(() => {
    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect({ Authorization: `Bearer ${token}`}, () => {
      console.log("Socket conneted")
      setStompClient(client);
      
     

       client.subscribe("/topic/yourID", (msg) => {
        console.log("-----------------")
        const body = JSON.parse(msg.body);
        console.log(body)
        setYourID(body.id);
      });


    client.subscribe("/topic/allUsers", (msg) => {
      console.log("kjk")
        const list = JSON.parse(msg.body);
        console.log("list");
        console.log(list)
        const mapped = {};
        list.forEach(id => mapped[id] = true);
        setUsers(mapped);
      });

      client.send("/app/signal", {}, JSON.stringify({
        type: "REGISTER",
        roomId,
        user: token
      }));

    client.subscribe("/user/queue/hey", (msg) => {
        const data = JSON.parse(msg.body);

      });

      client.subscribe("/user/queue/accept", (msg) => {
        const data = JSON.parse(msg.body);

      });


    });
    

    return () => {
    if (client) {
      client.disconnect(() => {
        console.log("STOMP socket disconnected");
      });
    }
  };
  }, [roomId]);

  function callPeer(id) {
    
  }

  function acceptCall() {
    
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <Video playsInline ref={partnerVideo} autoPlay />
    );
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        <button onClick={acceptCall}>Accept</button>
      </div>
    )
  }

  return (
    <Container>
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>
        {Object.keys(users).map(key => {
          if (key === yourID) {
            return null;
          }
          return (
            <button onClick={() => callPeer(key)}>Call {key}</button>
          );
        })}
      </Row>
      <Row>
        {incomingCall}
      </Row>
    </Container>
  );
}

export default Room














// const Room = () => {
//   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
//   const WS_URL = process.env.REACT_APP_WS_URL;
//   const { roomID: roomId } = useParams();
//   const [roomData, setRoomData] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStreams, setRemoteStreams] = useState([]);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [stompClient, setStompClient] = useState(null);
//   const [peerConnections, setPeerConnections] = useState({});
//   const [iceServers] = useState({
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//       { urls: "stun:stun2.l.google.com:19302" },
//     ],
//   });

//   const token = localStorage.getItem("token");
//   const currentProfileId = token ? jwtDecode(token)?.profileID : null;
//   const localVideoRef = useRef(null);
//   const remoteVideosRef = useRef([]);
//   const screenShareRef = useRef(null);

//   // Check if current user is admin
//   const isAdmin = roomData?.playersInRoom?.some(
//     (player) => player.profileId === currentProfileId && player.isAdmin
//   );

//   // Initialize WebSocket connection
//   useEffect(() => {
//     const socket = new SockJS(WS_URL);
//     const client = Stomp.over(socket);

//     client.connect({}, () => {
//       setStompClient(client);
//       client.subscribe(`/topic/room/${roomId}`, handleSignalMessage);
//     });

//     return () => {
//       if (client) {
//         client.disconnect();
//       }
//     };
//   }, [roomId]);

//   // Fetch room data
//   useEffect(() => {
//   const fetchRoomData = async () => {
//     try {
      
      
//       const response = await axios.get(
//         `${API_BASE_URL}/room/viewRoom/${roomId}`,
//         { 
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             'Accept': 'application/json',
//             'ngrok-skip-browser-warning': 'true'
//           },
//           withCredentials: false
//         }
//       );
      
//       console.log("API Response:", response); // Debug response
      
//       if (response.data.status === "00") {
//         setRoomData(response.data.data);
//       } else {
//         console.error("❌ Failed to fetch room data", response.data);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching room:", {
//         message: err.message,
//         response: err.response,
//         stack: err.stack
//       });
//     }
//   };

//   if (token && roomId) {
//     fetchRoomData();
//   }
// }, [roomId, token]);

//   // Initialize media and WebRTC when room data is available
//   useEffect(() => {
//     if (roomData) {
//       initializeMedia();
//     }

//     return () => {
//       // Cleanup
//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//       }
//       Object.values(peerConnections).forEach(pc => pc.close());
//     };
//   }, [roomData]);

//   const initializeMedia = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       setLocalStream(stream);
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }

//       // If admin, wait for others to join
//       // If not admin, send offer to admin
//       if (!isAdmin) {
//         const adminPlayer = roomData.playersInRoom.find(p => p.isAdmin);
//         if (adminPlayer) {
//           createPeerConnection(adminPlayer.profileId);
//         }
//       }
//     } catch (err) {
//       console.error("Error accessing media devices:", err);
//     }
//   };

//   const createPeerConnection = (targetProfileId) => {
//     const pc = new RTCPeerConnection(iceServers);
//     const newPeerConnections = { ...peerConnections, [targetProfileId]: pc };
//     setPeerConnections(newPeerConnections);

//     // Add local stream to connection
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         pc.addTrack(track, localStream);
//       });
//     }

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         sendSignalMessage({
//           type: "ice-candidate",
//           candidate: event.candidate,
//           targetProfileId,
//           senderProfileId: currentProfileId,
//           roomId,
//         });
//       }
//     };

//     pc.ontrack = (event) => {
//       const remoteStream = event.streams[0];
//       setRemoteStreams(prev => [...prev, {
//         profileId: targetProfileId,
//         stream: remoteStream
//       }]);
//     };

//     return pc;
//   };

//   const handleSignalMessage = (message) => {
//     const signalMessage = JSON.parse(message.body);
//     const { type, senderProfileId } = signalMessage;

//     // Ignore messages from self
//     if (senderProfileId === currentProfileId) return;

//     const pc = peerConnections[senderProfileId] || createPeerConnection(senderProfileId);

//     switch (type) {
//       case "offer":
//         handleOffer(pc, signalMessage);
//         break;
//       case "answer":
//         handleAnswer(pc, signalMessage);
//         break;
//       case "ice-candidate":
//         handleIceCandidate(pc, signalMessage);
//         break;
//       default:
//         console.warn("Unknown signal message type:", type);
//     }
//   };

//   const handleOffer = async (pc, offer) => {
//     try {
//       await pc.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       sendSignalMessage({
//         type: "answer",
//         answer,
//         targetProfileId: offer.senderProfileId,
//         senderProfileId: currentProfileId,
//         roomId,
//       });
//     } catch (err) {
//       console.error("Error handling offer:", err);
//     }
//   };

//   const handleAnswer = async (pc, answer) => {
//     try {
//       await pc.setRemoteDescription(new RTCSessionDescription(answer));
//     } catch (err) {
//       console.error("Error handling answer:", err);
//     }
//   };

//   const handleIceCandidate = async (pc, candidate) => {
//     try {
//       await pc.addIceCandidate(new RTCIceCandidate(candidate.candidate));
//     } catch (err) {
//       console.error("Error adding ICE candidate:", err);
//     }
//   };

//   const sendSignalMessage = (message) => {
//     if (stompClient && stompClient.connected) {
//       stompClient.send("/app/signal", {}, JSON.stringify(message));
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const audioTracks = localStream.getAudioTracks();
//       audioTracks.forEach(track => {
//         track.enabled = !track.enabled;
//       });
//       setIsMuted(!isMuted);
//     }
//   };

//   const toggleVideo = () => {
//     if (localStream) {
//       const videoTracks = localStream.getVideoTracks();
//       videoTracks.forEach(track => {
//         track.enabled = !track.enabled;
//       });
//       setIsVideoOff(!isVideoOff);
//     }
//   };

//   const toggleScreenShare = async () => {
//     if (isScreenSharing) {
//       // Stop screen share
//       const screenStream = screenShareRef.current?.srcObject;
//       if (screenStream) {
//         screenStream.getTracks().forEach(track => track.stop());
//       }

//       // Switch back to camera
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
//       localVideoRef.current.srcObject = stream;

//       // Update all peer connections
//       Object.values(peerConnections).forEach(pc => {
//         const senders = pc.getSenders();
//         senders.forEach(sender => {
//           if (sender.track.kind === 'video') {
//             const videoTrack = stream.getVideoTracks()[0];
//             if (videoTrack) sender.replaceTrack(videoTrack);
//           }
//         });
//       });

//       setIsScreenSharing(false);
//     } else {
//       try {
//         // Start screen share
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//           audio: true,
//         });

//         screenShareRef.current.srcObject = screenStream;

//         // Update all peer connections
//         Object.values(peerConnections).forEach(pc => {
//           const senders = pc.getSenders();
//           senders.forEach(sender => {
//             if (sender.track.kind === 'video') {
//               const videoTrack = screenStream.getVideoTracks()[0];
//               if (videoTrack) sender.replaceTrack(videoTrack);
//             }
//           });
//         });

//         setIsScreenSharing(true);
//       } catch (err) {
//         console.error("Error sharing screen:", err);
//       }
//     }
//   };

//   const leaveCall = () => {
//     // Clean up and navigate away
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//     }
//     Object.values(peerConnections).forEach(pc => pc.close());
//     window.location.href = "/";
//   };

//   return (
//     <div className="room-container">
//       <div className="video-container">
//         {/* Local video */}
//         <div className="video-tile local-video">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             className={isVideoOff ? "video-off" : ""}
//           />
//           <div className="video-info">
//             <span>You ({isAdmin ? "Host" : "Guest"})</span>
//             {isVideoOff && <div className="video-off-placeholder">Video Off</div>}
//           </div>
//         </div>

//         {/* Remote videos */}
//         {remoteStreams.map((remote, index) => {
//           const player = roomData?.playersInRoom?.find(
//             p => p.profileId === remote.profileId
//           );
//           return (
//             <div className="video-tile remote-video" key={index}>
//               <video
//                 ref={el => remoteVideosRef.current[index] = el}
//                 srcObject={remote.stream}
//                 autoPlay
//                 playsInline
//                 className={remote.stream.getVideoTracks()[0]?.enabled ? "" : "video-off"}
//               />
//               <div className="video-info">
//                 <span>{player?.username || "Guest"} {player?.isAdmin ? "(Host)" : ""}</span>
//                 {!remote.stream.getVideoTracks()[0]?.enabled && (
//                   <div className="video-off-placeholder">Video Off</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         {/* Screen share (if active) */}
//         {isScreenSharing && (
//           <div className="screen-share">
//             <video ref={screenShareRef} autoPlay playsInline />
//             <div className="screen-share-label">Screen Share</div>
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="controls">
//         <button
//           className={`control-button ${isMuted ? "active" : ""}`}
//           onClick={toggleMute}
//           title={isMuted ? "Unmute" : "Mute"}
//         >
//           {isMuted ? "🔇" : "🎤"}
//         </button>
//         <button
//           className={`control-button ${isVideoOff ? "active" : ""}`}
//           onClick={toggleVideo}
//           title={isVideoOff ? "Turn on video" : "Turn off video"}
//         >
//           {isVideoOff ? "📷❌" : "📷"}
//         </button>
//         <button
//           className={`control-button ${isScreenSharing ? "active" : ""}`}
//           onClick={toggleScreenShare}
//           title={isScreenSharing ? "Stop sharing" : "Share screen"}
//         >
//           {isScreenSharing ? "🖥️❌" : "🖥️"}
//         </button>
//         <button
//           className="control-button end-call"
//           onClick={leaveCall}
//           title="Leave call"
//         >
//           📞❌
//         </button>
//       </div>

//       {/* Participants panel */}
//       <div className="participants-panel">
//         <h3>Participants ({roomData?.playersInRoom?.length || 0})</h3>
//         <ul>
//           {roomData?.playersInRoom?.map((player, index) => (
//             <li key={index}>
//               <img src={player.profilePic} alt={player.username} />
//               <span>
//                 {player.username} {player.isAdmin ? "(Host)" : ""}
//                 {player.profileId === currentProfileId && " (You)"}
//               </span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Room;