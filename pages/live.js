import React from "react";
import dynamic from "next/dynamic";

export default dynamic(
  () => {
    return import("../components/Video");
  },
  { ssr: false }
);
