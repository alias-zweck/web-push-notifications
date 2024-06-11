import * as functions from "firebase-functions";
import {admin} from "./admin";
import * as logger from "firebase-functions/logger";
import * as cors from "cors";

// Initialize CORS middleware
const corsHandler = cors({origin: true});

export const subscribe = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const {token, topic} = req.body;
    logger.info(req.body, {structuredData: true});
    admin.messaging().subscribeToTopic(token, topic)
      .then((response) => res.status(200).send(response))
      .catch((error) => res.status(500).send(error));
  });
});
