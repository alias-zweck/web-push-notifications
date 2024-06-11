const express = require("express");
const admin = require("./firebaseAdmin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Endpoint to subscribe to a topic
app.post("/subscribe", (req, res) => {
  const { token, topic } = req.body;
  admin
    .messaging()
    .subscribeToTopic(token, topic)
    .then((response) => res.status(200).send(response))
    .catch((error) => res.status(500).send(error));
});

// Endpoint to unsubscribe from a topic
app.post("/unsubscribe", (req, res) => {
  const { token, topic } = req.body;
  admin
    .messaging()
    .unsubscribeFromTopic(token, topic)
    .then((response) => res.status(200).send(response))
    .catch((error) => res.status(500).send(error));
});

app.post("/publish", (req, res) => {
  const { message, topic } = req.body;
  const { sender, text, timestamp = new Date() } = message;

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
      res
        .status(200)
        .send({ message: "Notification sent successfully", response });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.status(500).send({ message: "Failed to send notification", error });
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
