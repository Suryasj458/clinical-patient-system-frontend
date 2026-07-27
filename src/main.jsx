import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./styles.css";

const theme = createTheme({
  palette: { primary: { main: "#2563eb" }, background: { default: "#f5f7fa" } },
  typography: { fontFamily: "Arial, Helvetica, sans-serif" },
  shape: { borderRadius: 8 },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></React.StrictMode>,
);
