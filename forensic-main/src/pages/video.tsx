import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import axios from 'axios';
import { useParams } from "react-router-dom";

const socket = io('http://localhost:5500', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

interface EmailProps {
  officerEmail: string;
  citizenEmail: string;
}

const Video: React.FC<{ emails?: EmailProps }> = () => {
  const { caseId } = useParams();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [users, setUsers] = useState<{ [email: string]: string }>({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [yourEmail, setYourEmail] = useState<string>("");
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [caller, setCaller] = useState<string>("");
  const [receivingCall, setReceivingCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [emails, setEmails] = useState<EmailProps | null>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (emails?.officerEmail || emails?.citizenEmail) {
      const myEmail = emails.officerEmail || emails.citizenEmail;

      const registerUser = () => {
        console.log("🔁 Registering user:", myEmail);
        socket.emit("registerUser", myEmail);
      };

      socket.on("connect", registerUser);

      return () => {
        socket.off("connect", registerUser);
      };
    }
  }, [emails]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get(`http://localhost:5500/emails/${caseId}`);
        const data = res.data;
        setEmails({
          officerEmail: data.officer,
          citizenEmail: data.email,
        });
      } catch (err) {
        console.error("❌ Failed to fetch emails:", err);
      }
    };

    if (caseId) fetchEmails();

    socket.emit("requestUsers");

    const handleUsers = (userList: any) => {
      console.log("👥 Received user list:", userList);
      setUsers(userList);
    };

    socket.on("allUsers", handleUsers);

    return () => {
      socket.off("allUsers", handleUsers);
    };
  }, [caseId]);

  useEffect(() => {
    if (emails?.officerEmail) {
      setYourEmail(emails.officerEmail);
    }
  }, [emails]);

  useEffect(() => {
    if (yourEmail) {
      socket.emit("registerEmail", yourEmail);
      console.log("📤 Registered email:", yourEmail);
    }
  }, [yourEmail]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        setStream(localStream);
        if (myVideo.current) {
          myVideo.current.srcObject = localStream;
        }
      })
      .catch((err) => {
        console.error('❌ Error accessing media devices:', err);
        alert('Error accessing media devices');
      });
  }, []);

  useEffect(() => {
    socket.on("allUsers", (userList: { [email: string]: string }) => {
      setUsers(userList);
    });

    socket.on("hey", ({ signal, from }) => {
      console.log("📞 Incoming call from:", from);
      setReceivingCall(true);
      setCallerSignal(signal);
      setCaller(from);
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peerRef.current?.signal(signal);
    });

    return () => {
      socket.off("allUsers");
      socket.off("hey");
      socket.off("callAccepted");
    };
  }, []);

  useEffect(() => {
    if (
      stream &&
      emails?.citizenEmail &&
      users[emails.citizenEmail] &&
      yourEmail === emails.officerEmail
    ) {
      setTimeout(() => {
        callPeer(users[emails.citizenEmail]);
      }, 500);
    }
  }, [stream, users, emails, yourEmail]);

  const callPeer = (targetSocketId: string) => {
    if (isCalling || !stream) return;

    setIsCalling(true);
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signalData) => {
      socket.emit("callUser", {
        userToCall: targetSocketId,
        signalData,
        from: yourEmail,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peerRef.current = peer;
  };

  const answerCall = (signal: any, from: string) => {
    if (!stream) return;

    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("acceptCall", { signal: data, to: from });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(signal);
    peerRef.current = peer;
  };

  const toggleAudio = () => {
    if (stream) {
      const newAudioState = !audioEnabled;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = newAudioState;
      });
      setAudioEnabled(newAudioState);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const newVideoState = !videoEnabled;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = newVideoState;
      });
      setVideoEnabled(newVideoState);
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setCallAccepted(false);
    setReceivingCall(false);
    setCaller("");
    setIsCalling(false);

    if (partnerVideo.current) partnerVideo.current.srcObject = null;

    // Reset audio/video state
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
    }

    setAudioEnabled(true);
    setVideoEnabled(true);
  };

  if (!emails?.officerEmail || !emails?.citizenEmail) {
    return <div style={{ color: 'white', padding: '20px' }}>⏳ Waiting for call setup...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      <div style={{ flex: 1, display: 'flex' }}>
        <video ref={myVideo} playsInline muted autoPlay style={{ flex: 1, objectFit: 'cover' }} />
        <video ref={partnerVideo} playsInline autoPlay style={{ flex: 1, objectFit: 'cover', backgroundColor: '#222' }} />
      </div>

      <div style={{ height: '80px', backgroundColor: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', color: '#fff' }}>
        <button onClick={toggleAudio} style={buttonStyle}>
          {audioEnabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={toggleVideo} style={buttonStyle}>
          {videoEnabled ? 'Video Off' : 'Video On'}
        </button>
        <button onClick={endCall} style={{ ...buttonStyle, backgroundColor: '#e53935' }}>
          End Call
        </button>
      </div>

      {receivingCall && !callAccepted && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000,
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          }}
        >
          <h3>{caller} is calling you...</h3>
          <button onClick={() => answerCall(callerSignal, caller)} style={{ ...buttonStyle, marginTop: '10px' }}>
            Accept Call
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#444',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Video;
