const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let cartPrice = 0;

// WebSocket连接处理
wss.on('connection', (ws) => {
  // 向新连接的客户端发送当前购物车价格
  ws.send(JSON.stringify({ type: 'cart_price', data: cartPrice }));

  // 处理来自客户端的消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // 当接收到价格更新时，更新购物车价格
      if (data.type === 'update_price') {
        cartPrice = data.data;
        // 向所有已连接的客户端广播更新后的购物车价格
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'cart_price', data: cartPrice }));
          }
        });
      }
    } catch (error) {
      console.error('解析消息时出错：', error);
    }
  });
});

server.listen(3000, () => {
  console.log('服务器已启动，端口号：3000');
});
