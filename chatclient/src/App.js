import React from "react";
import Chatbot from "./components/Chatbot";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <h1 className="chatbot_topic">Feel free to ask</h1>
      <p className="chatbot_para">
        "Welcome! Feel free to ask anything that's on your mind—no question is
        too big or too small. This handcrafted chatbot is here to help, making
        every interaction friendly, approachable, and insightful. Whether you're
        curious, need guidance, or just want to explore, I'm here to make your
        experience seamless and enjoyable. Don't hesitate—let’s start the
        conversation!"
      </p>
      <Chatbot />
    </div>
  );
}

export default App;
