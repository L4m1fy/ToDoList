const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { processBotCommand } = require('../routes/chat');

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const projectId = socket.handshake.query.projectId;
    if (projectId) {
      socket.join(projectId);
    }

    socket.on('message', async (data) => {
      try {
        const message = new Message({
          project: data.projectId,
          sender: socket.userId,
          content: data.content
        });
        await message.save();
        
        io.to(data.projectId).emit('message', {
          ...message.toJSON(),
          content: message.decryptContent()
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('botCommand', async (data) => {
      try {
        const response = await processBotCommand(
          data.projectId,
          data.command.split(' ')[0],
          data.command.split(' ').slice(1),
          socket.userId
        );

        const botMessage = new Message({
          project: data.projectId,
          sender: socket.userId,
          content: response,
          isBot: true
        });
        await botMessage.save();

        io.to(data.projectId).emit('message', {
          ...botMessage.toJSON(),
          content: botMessage.decryptContent()
        });
      } catch (error) {
        console.error('Error processing bot command:', error);
      }
    });

    socket.on('disconnect', () => {
      if (projectId) {
        socket.leave(projectId);
      }
    });
  });
};
