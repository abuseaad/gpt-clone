import Sidebar from "./components/sidebar/Sidebar"
import { useState } from "react";
import ChatHeader from "./components/chatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import axios from "axios";

function App() {
  const [conversation setConversation] = useState([]);

async function fetchConversation (){
  try {
    const {data} = await axios.get("http://localhost:3888/api/chat/conversations",
    );
    setConversation(data.data);
    
  } catch (error) {
    console.log(error.message);
    
  }
  
}
fetchConversation();


  return (
    <div className="app">
      <Sidebar/>

      <main className="chat">
       <ChatHeader/>
       <MessageList conversation={conversation}/>
 

        {/* chatInput */}
      </main>
    </div>
  )
}

export default App;

