import { createServer } from "http";
import app from "./app.js";
import { config } from "./api/config/config.js";

const server = createServer(app);

//start server
server.listen(config.port, () => {
  console.log(`server is running on ${config.port}`);
});
