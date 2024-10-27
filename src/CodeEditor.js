import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Ensure socket is created outside any component or hook
const socket = io('http://localhost:4000', { autoConnect: false });

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [name,setName]=useState('')
  // Connect socket only once on mount
  useEffect(() => {
    socket.connect();

    socket.on('codeChange', (data) => setCode(data.code));

    // Listener for chat messages
    socket.on('chatMessage', (data) => {
      setMessages((prevMessages) => {
        // Prevent duplicate messages by checking message ID
        if (!prevMessages.some((msg) => msg.id === data.id)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off('codeChange');
      socket.off('chatMessage');
      socket.disconnect();
    };
  }, []);

  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('codeChange', { code: value, language });
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(`// Write your ${newLanguage} code here...`);
    socket.emit('codeChange', { code: `// Write your ${newLanguage} code here...`, language: newLanguage });
  };

  // Handle code execution
  const runCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language,
        version: '*',
        files: [{ content: code }],
      });
      setOutput(response.data.run.output || 'No output available.');
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send a chat message with unique ID
  const sendMessage = () => {
    if (message.trim()) {
      const msgData = { id: Date.now(), user: name, text: message };
      socket.emit('chatMessage', msgData);
      setMessages((prevMessages) => [...prevMessages, msgData]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6">Collaborative Code Editor</h2>

      <label htmlFor="language-select" className="mb-2">Select Language:</label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      <div className="w-full max-w-4xl mb-4">
        <Editor
          height="60vh"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <button onClick={runCode} className="mb-4 p-2 bg-blue-500 text-white rounded">
        {loading ? 'Running...' : 'Run'}
      </button>

      <div className="w-full max-w-4xl mb-4">
        <h3 className="text-lg font-semibold">Output:</h3>
        <pre className="bg-gray-200 p-4 border border-gray-300 rounded">{output}</pre>
      </div>
          <div className='flex justify-center my-4'>
            <label className='mx-3'>Name</label>
            <input className='border' onChange={(e)=>setName(e.target.value)}/>
          </div>
      <div className="w-full max-w-4xl p-4 bg-white border border-gray-300 rounded">
        <h3 className="text-lg font-semibold">Chat</h3>
        <div className="chat-box mb-4 h-48 overflow-y-auto bg-gray-100 p-2 rounded">
          {messages.map((msg, index) => (
            <p key={index}><strong>{msg.user}:</strong> {msg.text}</p>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border border-gray-300 rounded-l"
          />
          <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-r">Send</button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
