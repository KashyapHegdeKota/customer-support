'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
    }
  ]);
  
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    // Add the user message to the conversation
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }, // Placeholder for AI response
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const data = await response.json();

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: data.candidates[0].content.parts[0].text,
          },
        ];
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    
    setMessage(''); // Clear input field after sending the message
  };

  return (
    <Box 
      width={"100vw"} 
      height={"100vh"} 
      display={"flex"} 
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack
        direction={"column"}
        width={"600px"}
        height={"700px"}
        border={"1px solid black"}
        p={2}
        spacing={3}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow={"auto"}
          maxHeight={"100%"}
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display={'flex'} 
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box 
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color={"white"}
                borderRadius={16}
                p={3}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField 
            label="Enter a message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
