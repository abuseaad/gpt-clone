import Sidebar from "./components/sidebar/Sidebar"
import ChatHeader from "./components/chatHeader/ChatHeader"
import ChatMessage from "./components/MessageLIist/ChatMessage";
import { useState } from "react";
function App() {
  const [conversation. setConversation] = useState({})


  return (
    <div className="app">
      {/* sidebar */}
      <Sidebar/>

      <main className="chat">



        
        {/* chatHeader */}
            <ChatHeader/>




        {/* messageList */}
        <ChatMessage/>
        
      




        {/* chatInput */}
      </main>
    </div>
  )
}

export default App;

