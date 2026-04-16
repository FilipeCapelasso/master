const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e8 });

// CONFIGURAÇÃO SECRETA (Protegida no Servidor)
// Lembre-se de colocar a sua URL do Google Apps Script aqui!
const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "SUA_URL_AQUI";

app.disable('x-powered-by');

// Serve o seu novo HTML do Catálogo Interativo
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// A lógica do Socket.io que garante que as mensagens fiquem salvas
io.on('connection', (socket) => {
    const room = socket.handshake.query.room;
    const username = socket.handshake.query.username;

    if (room) {
        socket.join(room);
        
        // Quando o cliente enviar um pedido/mensagem
        socket.on('chat message', (msg) => {
            msg.username = username;
            
            // Envia para o frontend na hora (para não sumir do chat)
            io.to(room).emit('chat message', msg);

            // [Lógica Opcional] Envia para a sua SCRIPT_URL para salvar no histórico/planilha
            // axios.post(SCRIPT_URL, { room: room, user: username, message: msg.text }).catch(console.error);
        });

        socket.on('request clear', (roomToClear) => {
            io.to(roomToClear).emit('clear messages');
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Site Caminhos Gourmet online na porta ${PORT}`);
});