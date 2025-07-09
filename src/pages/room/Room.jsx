import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./room.scss";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import styled from "styled-components";
import Peer from "simple-peer";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  background: #111;
`;


const StyledVideo = styled.video`
  height: 240px;
  width: 320px;
  margin: 10px;
  border: 2px solid #444;
  border-radius: 10px;
  background: black;
  object-fit: cover;
`;



const Video = ({ peer }) => {
  const ref = useRef();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!peer) return;

    const setStreamIfExists = () => {
    if (ref.current && peer.streams && peer.streams[0]) {
      ref.current.srcObject = peer.streams[0];
      console.log("🟢 [Init] Set stream from peer.streams[0]");
      setLoaded(true);
    }
  };
    

    const handleStream = (stream) => {
      console.log("999999999999999999999999999999999999999999")
      console.log("📹---- Received remote stream:", stream);
      console.log("🎥---- Video Tracks:", stream.getVideoTracks());
      console.log("🎙️----- Audio Tracks:", stream.getAudioTracks());
      if (ref.current) {
        ref.current.srcObject = stream;
        setLoaded(true);
      } else {
        console.warn("⚠️ Video ref not ready");
      }
    };

    peer.on("stream", handleStream);
    setStreamIfExists()

    peer.on("connect", () => {
      console.log("✅ WebRTC peer connected");
    });

    peer.on("error", (err) => {
      console.error("❌ WebRTC peer error:", err);
    });

    return () => {
      peer.removeListener("stream", handleStream);
    };
  }, [peer]);

  return (
    <>
      {!loaded && <p style={{ color: "white", textAlign: "center" }}>Loading video...</p>}
      <StyledVideo playsInline autoPlay ref={ref} style={{ display: loaded ? "block" : "none" }} />
    </>
  );
};


const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = () => {
  const WS_URL = "http://localhost:8080/ws";
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [stompClient, setStompClient] = useState(null);
  const { roomID } = useParams();
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const profileID = decodedToken.profileID;
  const username = decodedToken.username;

  useEffect(() => {
    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("✅ STOMP connected");
        setStompClient(client);

        navigator.mediaDevices
          .getUserMedia({ video: videoConstraints, audio: true })
          .then((stream) => {
            userVideo.current.srcObject = stream;
            console.log(`[+] stream gotten =>>`, stream)

            // 1️⃣ Join Room
            client.send(
              "/app/signal",
              {},
              JSON.stringify({ type: "JOIN_ROOM", roomID, profileID })
            );
            console.log("Join room called")

            // 2️⃣ Receive list of all users
            client.subscribe(`/topic/room.${profileID}`, (msg) => {
              const payload = JSON.parse(msg.body);
              console.log("📩 Room payload:", payload);
              if (payload.type === "ALL_USERS") {
                const peersList = [];

                payload.users.forEach((userID) => {
                  const peer = createPeer(userID, profileID, stream, client);
                  peersRef.current.push({ peerID: userID, peer, signaled: false }); // In createPeer
                  console.log("[[[[ => peer that returned",peer)
                  peersList.push(peer);
                  
                });

                setPeers(peersList);
                console.log(`[+] peerList is =>` ,peersList)
              } else if (payload.type === "ROOM_FULL") {
                alert("Room is full");
              }
            });

            // 3️⃣ Handle signals
            client.subscribe(`/topic/signal.${profileID}`, (msg) => {
              const payload = JSON.parse(msg.body);

              if (payload.type === "USER_JOINED") {
                const exists = peersRef.current.some(
                  (p) => p.peerID === payload.callerID
                );
                if (!exists) {
                  const peer = addPeer(payload.signal, payload.callerID, stream, client);
                  console.log("!!!new peer added", peer)
                  peersRef.current.push({ peerID: payload.callerID, peer, signaled: false });

                  setPeers((prev) => [...prev, peer]);
                } else {
                  console.warn("⚠️ Duplicate USER_JOINED skipped:", payload.callerID);
                }
              } else if (payload.type === "RECEIVING_RETURNED_SIGNAL") {
  const item = peersRef.current.find((p) => p.peerID === payload.id);
  if (item?.peer && !item.peer.destroyed) {
    if (!item.signaled) {
      try {
        item.peer.signal(payload.signal);
        item.signaled = true; // mark this peer as already signaled
      } catch (err) {
        console.error("❌ Failed to apply returned signal:", err);
      }
    } else {
      console.warn("⚠️ Signal already applied for peer:", payload.id);
    }
  } else {
    console.warn("❗ Peer not found or already destroyed");
  }
}

            });
          })
          .catch((err) => {
            console.error("❌ Failed to get media stream:", err);
          });
      },
      (error) => {
        console.error("❌ STOMP connection error:", error);
      }
    );

    // Cleanup: disconnect stomp and destroy peers
    return () => {
      if (stompClient?.connected) {
        stompClient.disconnect(() => console.log("🔌 STOMP disconnected"));
      }

      peersRef.current.forEach(({ peer }) => {
        if (peer && !peer.destroyed) {
          peer.destroy();
        }
      });

      peersRef.current = [];
      setPeers([]);
    };
  }, [token, roomID]);

  function createPeer(userToSignal, callerID, stream, stompClient) {
    console.log("🎥 Creating peer with stream:", stream);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      stompClient.send(
        "/app/signal",
        {},
        JSON.stringify({
          type: "SENDING_SIGNAL",
          userToSignal,
          callerID,
          signal,
          profileID,
        })
      );
    });

    console.log("[+]on create createPeer", peer)
    return peer;
  }

  function addPeer(incomingSignal, callerID, stream, stompClient) {
    console.log("Tracks:", stream.getTracks());
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      stompClient.send(
        "/app/signal",
        {},
        JSON.stringify({
          type: "RETURNING_SIGNAL",
          callerID,
          signal,
          profileID,
        })
      );
    });

    try {
      peer.signal(incomingSignal);
    } catch (err) {
      console.error("❌ Failed to apply incoming signal:", err);
    }

    return peer;
  }

  return (
    console.log("🔍 Rendering peers:", peers.length),
    <Container>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => (
        <div key={peersRef.current[index]?.peerID || index}>
           <p style={{ color: "white", textAlign: "center" }}>{username}</p>
           <Video key={peersRef.current[index]?.peerID || index} peer={peer} />
        </div>
         
      ))}
    </Container>
  );
};

export default Room;
