// useCall.tsx (custom React hook)
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io("http://localhost:5500");

export default function useCall(myEmail: string ) {
  const [callIncoming, setCallIncoming] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerId, setCallerId] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false); 

  const myVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    socket.emit("registerUser", myEmail, (res) => {
      console.log("Registered:", res);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((str) => {
      setStream(str);
      if (myVideo.current) myVideo.current.srcObject = str;
    });

    socket.on("incomingCall", ({ signal, from }) => {
      setCallerSignal(signal);
      setCallerId(from);
      setCallIncoming(true);
    });

    socket.on("callAccepted", (signal) => {
      peerRef.current?.signal(signal);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const callUser = (emailToCall: string) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signalData) => {
      socket.emit("callUser", {
        userToCall: emailToCall,
        signalData,
        from: myEmail,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peerRef.current = peer;
  };

  const acceptCall = () => {
    setCallAccepted(true);
    setCallIncoming(false);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signalData) => {
      socket.emit("acceptCall", {
        to: callerId,
        signal: signalData,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(callerSignal);
    peerRef.current = peer;
  };
  const rejectCall = () => {
    socket.emit("rejectCall", { to: callerId });
    setCallIncoming(false);
    setCallRejected(true);
    setCallerId("");
    setCallerSignal(null);
  };

  return {
    myVideo,
    partnerVideo,
    callUser,
    acceptCall,
    rejectCall,
    callIncoming,
    callAccepted,
  };
}
