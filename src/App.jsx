import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Album from "./components/Album";
import Footer from "./components/Footer";
import "./styles/global.css";
import "./App.css";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#gallery">
        Skip to gallery
      </a>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="site-main">
        <Hero />
        <Album searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
