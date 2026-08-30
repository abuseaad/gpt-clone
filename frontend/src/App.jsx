import Sidebar from "./components/sidebar/Sidebar"
import ChatHeader from "./components/chatHeader/ChatHeader"
import ChatMessage from "./components/MessageList/ChatMessage"
function App() {
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

