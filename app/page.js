"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import {
  firestore,
  auth,
  signInWithPopup,
  signOut,
} from "../firebase/firebase";
import { GoogleAuthProvider } from "firebase/auth";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi I'm the Headstarter Support Agent, how can I assist you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userName, setUserName] = useState(""); // Authenticated user's name
  const [allFeedbacks, setAllFeedbacks] = useState([]); // Feedback list

  useEffect(() => {
    // Check if user is signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
        fetchFeedbacks(); // Fetch feedbacks when user is authenticated
      } else {
        setUserName("");
        setAllFeedbacks([]); // Clear feedbacks if not signed in
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUserName(result.user.displayName);
      fetchFeedbacks(); // Fetch feedbacks after signing in
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserName("");
      setAllFeedbacks([]); // Clear feedbacks after signing out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "..." },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      const data = await response.json();

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: data.candidates[0].content.parts[0].text,
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updatedMessages;
      });
    }

    setMessage("");
  };

  const handleFeedbackSubmit = async () => {
    if (!userName) {
      console.error("User not authenticated. Feedback cannot be submitted.");
      return;
    }

    try {
      await addDoc(collection(firestore, "feedbacks"), {
        name: userName,
        feedback: feedback,
        timestamp: new Date(),
      });

      setFeedback("");
      setFeedbackOpen(false);
      fetchFeedbacks(); // Fetch feedbacks after submission
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const feedbacksSnapshot = await getDocs(
        collection(firestore, "feedbacks")
      );
      const feedbacksList = feedbacksSnapshot.docs.map((doc) => doc.data());
      setAllFeedbacks(feedbacksList);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {!userName ? (
        <Button variant="contained" onClick={signInWithGoogle}>
          Sign in with Google
        </Button>
      ) : (
        <Stack spacing={2} alignItems="center" width="100%">
          <Typography variant="h4">Welcome, {userName}</Typography>
          <Button variant="contained" onClick={signOutUser}>
            Sign Out
          </Button>

          <Paper
            elevation={3}
            sx={{
              padding: 2,
              width: "80%",
              height: "50vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack spacing={2}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
                  bgcolor={msg.role === "user" ? "primary.main" : "grey.300"}
                  color={msg.role === "user" ? "white" : "black"}
                  borderRadius={1}
                  p={1}
                  sx={{ maxWidth: "70%", wordWrap: "break-word" }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper elevation={3} sx={{ padding: 2, width: "80%" }}>
            <Stack spacing={2} direction="row" alignItems="center">
              <TextField
                label="Message"
                variant="outlined"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <Button variant="contained" onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Paper>

          <Button
            variant="outlined"
            onClick={() => setFeedbackOpen(true)}
            sx={{ mt: 2 }}
          >
            Submit Feedback
          </Button>

          <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)}>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogContent>
              <TextField
                label="Feedback"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
              <Button onClick={handleFeedbackSubmit}>Submit</Button>
            </DialogActions>
          </Dialog>

          <Stack spacing={2} sx={{ width: "80%" }}>
            {allFeedbacks.map((fb, index) => (
              <Paper key={index} elevation={2} sx={{ padding: 2 }}>
                <Typography variant="body1">{fb.feedback}</Typography>
                <Typography variant="caption">- {fb.name}</Typography>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
