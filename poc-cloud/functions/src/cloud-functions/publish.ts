import * as functions from "firebase-functions";
import {admin} from "./admin";
import * as cors from "cors";

// Initialize CORS middleware
const corsHandler = cors({origin: true});

export const publish = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const {message, topic} = req.body;
    const {sender, text, timestamp} = message;

    admin
      .messaging()
      .send({
        notification: {
          title: "New Message Received!",
          body: text,
        },
        data: {
          sender,
          timestamp,
        },
        topic: topic,
      })
      .then((response) => {
        console.log("Successfully sent message:", response);
        res.status(200).send({message: "Notification sent", response});
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        res.status(500).send({message: "Failed to send notification", error});
      });
  });
});
