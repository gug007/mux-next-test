import React from "react";
import ReactPlayer from "react-player";

export default function Video() {
  return (
    <div style={{ paddingTop: 12, maxWidth: "980px", margin: "0 auto" }}>
      <ReactPlayer
        url={process.env.VIDEO_URL}
        playing={true}
        muted={true}
        controls={true}
        width="100%"
        height="auto"
      />
    </div>
  );
}
