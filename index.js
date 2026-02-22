// /**
//  * Firebase Functions entry point
//  */

// const { setGlobalOptions } = require("firebase-functions");
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");
// const { getMessaging } = require("firebase-admin/messaging");

// setGlobalOptions({ maxInstances: 10 });

// admin.initializeApp();
// const db = admin.firestore();

// // ------------------ Nodemailer Setup ------------------
// // Use Firebase environment variables for Gmail credentials
// // Run: firebase functions:config:set gmail.email="your@gmail.com" gmail.pass="your-app-password"
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: functions.config().gmail.email || process.env.GMAIL_USER,
//     pass: functions.config().gmail.pass || process.env.GMAIL_PASS,
//   },
// });

// // ------------------ Firestore Trigger: Notifications ------------------
// exports.sendEmailNotification = functions.firestore
//   .document("notifications/{notifId}")
//   .onCreate(async (snap, context) => {
//     const notif = snap.data();

//     try {
//       // Get user email + FCM token
//       const userDoc = await db.collection("users").doc(notif.userId).get();
//       if (!userDoc.exists) return null;
//       const user = userDoc.data();

//       // 1️⃣ Email
//       if (user.email) {
//         const mailOptions = {
//           from: `"Campus Voice" <${functions.config().gmail.email}>`,
//           to: user.email,
//           subject: notif.title,
//           text: notif.message,
//         };
//         await transporter.sendMail(mailOptions);
//         console.log("Email sent to", user.email);
//       }

//       // 2️⃣ Push notification
//       if (user.fcmToken) {
//         await getMessaging().send({
//           token: user.fcmToken,
//           notification: {
//             title: notif.title,
//             body: notif.message,
//           },
//         });
//         console.log("Push notification sent to", user.fcmToken);
//       }

//       return null;
//     } catch (error) {
//       console.error("Error in sendEmailNotification:", error);
//       return null;
//     }
//   });

// // ------------------ Firestore Trigger: Complaint Updates ------------------
// exports.notifyComplaintCompletion = functions.firestore
//   .document("complaints/{complaintId}")
//   .onUpdate(async (change, context) => {
//     const newData = change.after.data();
//     const prevData = change.before.data();

//     if (prevData.status !== "Completed" && newData.status === "Completed") {
//       const userId = newData.userId;

//       try {
//         // Fetch user
//         const userDoc = await db.collection("users").doc(userId).get();
//         if (!userDoc.exists) return null;
//         const user = userDoc.data();

//         // 1️⃣ In-app notification
//         await db.collection("notifications").add({
//           userId,
//           title: "Complaint Completed 🎉",
//           message: `Your complaint "${newData.title}" has been resolved.`,
//           read: false,
//           timestamp: admin.firestore.FieldValue.serverTimestamp(),
//         });

//         // 2️⃣ Email
//         if (user.email) {
//           await transporter.sendMail({
//             from: `"Campus Voice" <${functions.config().gmail.email}>`,
//             to: user.email,
//             subject: "Your Complaint is Completed",
//             text: `Hello ${user.name || "User"},\n\nYour complaint "${newData.title}" has been marked as completed.\n\nRegards,\nCampus Voice Team`,
//           });
//           console.log("Completion email sent to", user.email);
//         }

//         // 3️⃣ Push notification
//         if (user.fcmToken) {
//           await admin.messaging().send({
//             token: user.fcmToken,
//             notification: {
//               title: "Complaint Completed 🎉",
//               body: `Your complaint "${newData.title}" has been resolved.`,
//             },
//           });
//           console.log("Completion push notification sent");
//         }
//       } catch (err) {
//         console.error("Error in notifyComplaintCompletion:", err);
//       }
//     }

//     return null;
//   });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// ------------------ Nodemailer Setup ------------------
// Firebase env variables: gmail.email, gmail.pass
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email || process.env.GMAIL_USER,
    pass: functions.config().gmail.pass || process.env.GMAIL_PASS,
  },
});

// ------------------ Firestore Trigger: Complaint Completion ------------------
exports.notifyComplaintCompletion = functions.firestore
  .document("complaints/{complaintId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "Completed" && after.status === "Completed") {
      try {
        const userRef = db.collection("users").doc(after.userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return null;
        const user = userDoc.data();

        const notificationData = {
          userId: after.userId,
          title: "Complaint Completed 🎉",
          message: `Your complaint "${after.title}" has been resolved.`,
          read: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 1️⃣ Add in-app notification
        await db.collection("notifications").add(notificationData);

        // 2️⃣ Send Email
        if (user.email) {
          await transporter.sendMail({
            from: `"Campus Voice" <${functions.config().gmail.email}>`,
            to: user.email,
            subject: "Your Complaint is Completed",
            text: `Hello ${user.name || "User"},\n\nYour complaint "${after.title}" has been marked as completed.\n\nRegards,\nCampus Voice Team`,
          });
        }

        // 3️⃣ Push Notification via FCM
        if (user.fcmToken) {
          await admin.messaging().send({
            token: user.fcmToken,
            notification: {
              title: notificationData.title,
              body: notificationData.message,
            },
          });
        }

        console.log("Notification/email/push sent for complaint:", after.id);
      } catch (err) {
        console.error("Error in notifyComplaintCompletion:", err);
      }
    }

    return null;
  });