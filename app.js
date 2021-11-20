const express = require("express");
const mongodb = require("./shared/mongo");
const userRoutes = require("./routes/user.routes");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3001;
// const port = 3001;

(async () => {
  try {
    await mongodb.connect();
    app.use(cors());
    app.use(express.json());
    app.use("/users", userRoutes);
    app.listen(port, () => {
      console.log("server Started at", port);
    });
  } catch (err) {
    console.log(err);
  }
})();
