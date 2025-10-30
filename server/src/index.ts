import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path: "../.env"
});

const PORT = process.env.PORT || "3000";

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log("Server listening on PORT: ", PORT);
        })
    } catch (error) {
        console.error("Error in initializing server: ", error);
    }
})();