import { app } from "./app.js";
import { connectDB } from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server Listening at port : ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("❌ MONGO_DB CONNECTION FAILED ERROR:", error);
    process.exit(1);
  });
console.log("here iam")