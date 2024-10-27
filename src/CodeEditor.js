import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000', { autoConnect: false });

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false); // Track if a message is being sent

  useEffect(() => {
    const savedCode = localStorage.getItem('code');
    if (savedCode) setCode(savedCode);

    socket.connect();

    // Ask for the user's name when connecting
    const userName = prompt('Enter your name:');
    if (userName) {
      setName(userName);
      socket.emit('userJoin', userName);
    }

    // Set up socket listeners
    socket.on('codeChange', (data) => setCode(data.code));
    socket.on('chatMessage', (data) => {
      console.log('Message received:', data); // Debugging log
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    socket.on('updateUserList', (connectedUsers) => {
      setUsers(connectedUsers);
    });

<<<<<<< HEAD
=======
    socket.on('chatReset', () => {
      setMessages([]);
    });

>>>>>>> 0ff1172 (Latest Project)
    // Fetch previous messages from the server on load
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:4000/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Cleanup function to remove listeners
    return () => {
      socket.off('codeChange');
      socket.off('chatMessage');
      socket.off('updateUserList');
<<<<<<< HEAD
=======
      socket.off('chatReset');
>>>>>>> 0ff1172 (Latest Project)
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('code', code);
  }, [code]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('codeChange', { code: value, language });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(`// Write your ${newLanguage} code here...`);
    socket.emit('codeChange', { code: `// Write your ${newLanguage} code here...`, language: newLanguage });
  };

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

  const saveFile = async () => {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `code.${language}`,
        types: [
          {
            description: 'Code File',
            accept: { 'text/plain': ['.js', '.py', '.cpp', '.java'] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(code);
      await writable.close();
      alert('File saved successfully!');
    } catch (error) {
      console.error('Save canceled or failed:', error);
<<<<<<< HEAD
    }
  };

  const sendMessage = async () => {
    if (sending) return; // Prevent multiple sends
    if (message.trim()) {
      const msgData = { id: Date.now(), user: name, text: message };
      
      // Emit the message
      console.log('Sending message:', msgData); // Debugging log
      setSending(true); // Set sending to true
      socket.emit('chatMessage', msgData);
      
      // Update local messages state
     // setMessages((prevMessages) => [...prevMessages, msgData]);
      
      setMessage('');

      // Save the message to MongoDB
      try {
        await axios.post('http://localhost:4000/messages', msgData);
      } catch (error) {
        console.error('Error saving message to the database:', error);
      } finally {
        setSending(false); // Reset sending state after the operation
      }
=======
>>>>>>> 0ff1172 (Latest Project)
    }
  };

  const sendMessage = async () => {
    if (sending) return; // Prevent multiple sends
    if (message.trim()) {
      const msgData = { id: Date.now(), user: name, text: message };
      
      // Emit the message
      console.log('Sending message:', msgData); // Debugging log
      setSending(true); // Set sending to true
      socket.emit('chatMessage', msgData);
      
      // Update local messages state
     // setMessages((prevMessages) => [...prevMessages, msgData]);
      
      setMessage('');

      // Save the message to MongoDB
      try {
        await axios.post('http://localhost:4000/messages', msgData);
      } catch (error) {
        console.error('Error saving message to the database:', error);
      } finally {
        setSending(false); // Reset sending state after the operation
      }
    }
  };

  const resetChat = async () => {
    try {
      socket.emit('resetChat');
      await axios.delete('http://localhost:4000/messages');
      setMessages([]);
    } catch (error) {
      console.error('Error resetting chat:', error);
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
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="flex mb-4 space-x-4">
        <button onClick={runCode} className="p-2 bg-blue-500 text-white rounded">
          {loading ? 'Running...' : 'Run'}
        </button>
        <button onClick={saveFile} className="p-2 bg-green-500 text-white rounded">Save Code</button>
        
      </div>

      <div className="w-full max-w-4xl mb-4">
        <h3 className="text-lg font-semibold">Output:</h3>
        <pre className="bg-gray-200 p-4 border border-gray-300 rounded">{output}</pre>
      </div>

      <div className="w-full max-w-4xl p-4 bg-white border border-gray-300 rounded mb-4">
        <h3 className="text-lg font-semibold">Connected Users:</h3>
        <ul className="list-disc pl-5">
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
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
            className="border p-2 flex-grow mr-2"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded" disabled={sending}>Send</button>
          <button onClick={resetChat} className="p-2 bg-red-500 text-white rounded ml-2">
          Reset Chat
        </button>
        </div>
      </div>
    </div>
  );
};


export default CodeEditor;
