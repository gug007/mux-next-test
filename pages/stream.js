import React, { useEffect, useState, useRef } from "react";

const CAMERA_CONSTRAINTS = {
  audio: true,
  video: { width: 960, height: 540 },
};

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const inputStreamRef = useRef();
  const videoRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();

  useEffect(() => {
    (async () => {
      inputStreamRef.current = await navigator.mediaDevices.getUserMedia(
        CAMERA_CONSTRAINTS
      );
      videoRef.current.srcObject = inputStreamRef.current;
      await videoRef.current.play();
      setCameraEnabled(true);
    })();
  }, []);

  const stopStreaming = () => {
    mediaRecorderRef.current.stop();
    setStreaming(false);
  };

  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace("http", "ws");
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/rtmp?key=streamKey`
    );

    wsRef.current.addEventListener("open", function open() {
      setConnected(true);
    });

    wsRef.current.addEventListener("close", () => {
      setConnected(false);
      stopStreaming();
    });

    const outputStream = new MediaStream();
    inputStreamRef.current.getTracks().forEach(function (t) {
      outputStream.addTrack(t);
    });

    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 3000000,
    });

    mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
      console.log(111, e.data);
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener("stop", () => {
      stopStreaming();
      wsRef.current.close();
    });

    mediaRecorderRef.current.start(1000);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    };
  }, []);

  return (
    <div style={{ paddingTop: 12, maxWidth: "980px", margin: "0 auto" }}>
      {cameraEnabled &&
        (streaming ? (
          <div>
            <span>{connected ? "Connected" : "Disconnected"}</span>
            <button className="button button-outline" onClick={stopStreaming}>
              Stop Streaming
            </button>
          </div>
        ) : (
          <>
            <button className="button button-outline" onClick={startStreaming}>
              Start Streaming
            </button>
          </>
        ))}
      <div className="row">
        <div className="column">
          <video
            ref={videoRef}
            controls={false}
            width="100%"
            height="auto"
            muted
          />
        </div>
      </div>
    </div>
  );
};
