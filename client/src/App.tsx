import { useEffect, useState } from "react";

const App = () => {
  // State to track the socket connection
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");

  // Connect to the server
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => {
      console.log("Connected to the server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("Received a message from the server");

      // Check if event.data is a Blob and convert it to text
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          setMessages((prevMessages) => [...prevMessages, text]);
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === "string") {
        setMessages((prevMessages) => [...prevMessages, event.data]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from the server");
      setSocket(null);
    };

    ws.onerror = (err) => {
      console.error(err);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!socket) {
    return (
      <div>
        <h1>Connecting to the server...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-50 w-screen">
      <h1 className="text-3xl font-bold mb-4">Websocket Chat</h1>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg mb-4 p-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className="p-2 border-b last:border-b-0 text-black"
            >
              {message}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={() => {
              socket.send(userMessage);
              setUserMessage("");
            }}
            className="bg-blue-500 text-white rounded-r-lg px-4 hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
