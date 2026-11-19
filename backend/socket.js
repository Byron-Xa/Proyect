const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const db = require("./db/db");
const verificarAcceso = require("./helpers/permisosHelper");
const presence = require("./helpers/presence");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No autorizado"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [rows] = await db.query(
        "SELECT id, rol_id, activo, token_version FROM usuarios WHERE id = ? LIMIT 1",
        [decoded.id],
      );
      const user = rows[0];

      if (
        !user ||
        user.activo !== "A" ||
        Number(decoded.version) !== Number(user.token_version)
      ) {
        return next(new Error("Sesión inválida"));
      }

      socket.user = { id: user.id, rol_id: user.rol_id, exp: decoded.exp };
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", async (socket) => {
    const { id, exp } = socket.user;

    const timer = setTimeout(
      () => socket.disconnect(true),
      Math.max(exp * 1000 - Date.now(), 0),
    );

    if (presence.add(id, socket.id)) {
      io.to("presence").emit("presence:update", { id, online: true });
    }
    try {
      if (await verificarAcceso(socket.user, "usuarios", "ver"))
        socket.join("presence");
    } catch (e) {
      console.error("Socket permisos:", e);
    }

    socket.on("disconnect", () => {
      clearTimeout(timer);
      if (presence.remove(id, socket.id)) {
        io.to("presence").emit("presence:update", {
          id,
          online: false,
          ultimo_visto: new Date().toISOString(),
        });
      }
    });
  });
}

function disconnectUser(userId) {
  if (!io) return;
  for (const [, s] of io.sockets.sockets) {
    if (s.user?.id === Number(userId)) s.disconnect(true);
  }
}

module.exports = { initSocket, disconnectUser };
