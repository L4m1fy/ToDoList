import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { io } from 'socket.io-client';

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('/', {
      query: { projectId: id }
    });

    newSocket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('taskUpdate', () => {
      fetchTasks();
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchMessages();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/api/tasks/project/${id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      if (newMessage.startsWith('/')) {
        // Handle bot commands
        socket.emit('botCommand', {
          projectId: id,
          command: newMessage.slice(1)
        });
      } else {
        socket.emit('message', {
          projectId: id,
          content: newMessage
        });
      }
      setNewMessage('');
    }
  };

  const handleCreateTask = async () => {
    try {
      await axios.post('/api/tasks', {
        ...newTask,
        project: id
      });
      setOpenDialog(false);
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskProgress = async (taskId, progress) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/progress`, { progress });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h4">{project.name}</Typography>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Overall Progress: {project.progress}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Tasks</Typography>
              <IconButton onClick={() => setOpenDialog(true)}>
                <AddIcon />
              </IconButton>
            </Box>
            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task._id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">{task.description}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ mt: 1 }}
                          onClick={() => handleUpdateTaskProgress(task._id, task.progress + 10)}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Team Chat</Typography>
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {messages.map((message) => (
                <Box key={message._id} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{message.sender.username}</Typography>
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message or /command"
              />
              <Button variant="contained" onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Project;
