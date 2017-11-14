//@flow
import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import rawData from "src/data";
render(<App rawData={rawData.slice(10)} />, document.getElementById("root"));
