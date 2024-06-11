import * as functions from "firebase-functions";
import {admin} from "./admin";
import * as cors from "cors";

// Initialize CORS middleware
const corsHandler = cors({origin: true});

export const unsubscribe = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const {token, topic} = req.body;

    admin.messaging().unsubscribeFromTopic(token, topic)
      .then((response) => res.status(200).send(response))
      .catch((error) => res.status(500).send(error));
  });
});
