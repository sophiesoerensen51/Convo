import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const notifyChatroomUsers = onDocumentCreated(
  "chatrooms/{chatroomId}/messages/{messageId}",
  async (event) => {
    const snap = event.data;
    const chatroomId = event.params.chatroomId;

    if (!snap || !snap.data || !snap.data().text) {
      console.log("Ingen beskeddata fundet.");
      return;
    }

    const messageData = snap.data();
    const messageText = messageData.text;
    const senderName = messageData.senderName || "Ny besked";
    const senderId = messageData.senderId;

    try {
      const usersSnapshot = await admin.firestore().collection("Users")
        .where("chatroomIds", "array-contains", chatroomId)
        .get();

      const tokens: string[] = [];

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken && doc.id !== senderId) {
          tokens.push(userData.fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log("Ingen tokens fundet for chatroom:", chatroomId);
        return;
      }

      const payload = {
        notification: {
          title: senderName,
          body: messageText,
        },
        data: {
          chatroomId,
        },
      };

      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log("Notifikation sendt:", response);
    } catch (error) {
      console.error("Fejl ved notifikation:", error);
    }
  }
);
