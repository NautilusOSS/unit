import React from "react";
import App from "./App";
import "./style.css";
import { createRoot } from 'react-dom/client';

// ? Migrated to create root instead since ReactDOM.render is deprecated
const container=document.getElementById("root");
const root = createRoot(container!);
root.render(<App  />)

// ReactDOM.render(<App />, );
