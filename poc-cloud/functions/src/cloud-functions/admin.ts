import * as admin from "firebase-admin";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();
const accountPath = path.resolve(__dirname, "../../service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(accountPath),
  // credential: admin.credential.applicationDefault(),
  //   credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://poc-push-notification-bb920.firebaseio.com",
});

export {admin};
