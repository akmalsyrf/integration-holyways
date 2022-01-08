const { user, chat } = require("../../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const connectedUser = {};
const socketIo = (io) => {
  // create middlewares before connection event
  // to prevent client access socket server without token
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next();
    } else {
      next(new Error("Not Authorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("client connect: ", socket.id);

    // get user connected id
    const userId = socket.handshake.query.id;

    // save to connectedUser
    connectedUser[userId] = socket.id;

    // define listener on event load contact
    socket.on("load contacts", async () => {
      try {
        let contacts = await user.findAll({
          include: [
            {
              model: chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["updatedAt", "idRecipient",],
              },
            },
            {
              model: chat,
              as: "senderMessage",
              attributes: {
                exclude: ["updatedAt", "idSender"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        contacts = JSON.parse(JSON.stringify(contacts));
        // contacts = contacts.map((item)=> ({
        //   ...item,
          // senderMessage: item.senderMessage.map((message) => {
          //   // console.log(message.idRecipient == socket.handshake.query.id);
          //   if (message.idRecipient == socket.handshake.query.id) {
          //     console.log(message);
          //     return message
          //   } else {
          //     // console.log(message);
          //     return ""
          //   }
          // }),
          // recipientMessage: item.recipientMessage.map((message) => {
          //   // console.log(message.idSender == socket.handshake.query.id);
          //   if (message.idSender == socket.handshake.query.id) {
          //     // console.log(message);
          //     return message
          //   } else {
          //     // console.log(message);
          //     return ""
          //   }
          // })
        // }))
        console.log(contacts[0]);

        socket.emit("contacts", contacts);
      } catch (err) {
        console.log(err);
      }
    });

    // define listener on event load messages
    socket.on("load messages", async (payload) => {
      try {
        const token = socket.handshake.auth.token;

        const tokenKey = process.env.TOKEN_API;
        const verified = jwt.verify(token, tokenKey);

        const idRecipient = payload; // catch recipient id sent from client
        const idSender = verified.id; //id user

        const data = await chat.findAll({
          where: {
            idSender: {
              [Op.or]: [idRecipient, idSender],
            },
            idRecipient: {
              [Op.or]: [idRecipient, idSender],
            },
          },
          include: [
            {
              model: user,
              as: "recipient",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
            {
              model: user,
              as: "sender",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
          ],
          order: [["createdAt", "ASC"]],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
          },
        });

        socket.emit("messages", data);
      } catch (error) {
        console.log(error);
      }
    });

    // define listener on event send message
    socket.on("send message", async (payload) => {
      try {
        const token = socket.handshake.auth.token;

        const tokenKey = process.env.TOKEN_API;
        const verified = jwt.verify(token, tokenKey);

        const idSender = verified.id; //id user
        const { message, idRecipient } = payload; // catch recipient id and message sent from client

        await chat.create({
          message,
          idRecipient,
          idSender,
        });

        // emit to just sender and recipient default rooms by their socket id
        io.to(socket.id).to(connectedUser[idRecipient]).emit("new message", idRecipient);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("client disconnected", socket.id);
      delete connectedUser[userId];
    });
  });
};

module.exports = socketIo;
