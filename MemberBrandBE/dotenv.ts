const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });
const keyPath = path.resolve(__dirname, "./keys/auth-key.p8");
export default keyPath;
