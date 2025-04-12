import React from "react";
import BackgroundAnimation from "./components/animation/BackgroundAnimation";
import AppRouter from "./router/router";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BackgroundAnimation
        starCount={500} //  mais estrelas
        starColor="rgba(230, 230, 255, 0.9)" //  estrelas levemente azuladas
      />
      <main className="main-content">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
