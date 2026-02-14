const webpush = require('web-push');

// This ensures the service only initializes if the keys exist in .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:naveentech759@gmail.com', // Your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("✅ VAPID details set successfully");
} else {
  console.error("❌ VAPID Keys missing in .env file!");
}

const sendPushNotification = async (student, title, body) => {
  if (!student || !student.pushSubscription) return;

  const payload = JSON.stringify({
    title: title,
    body: body,
    icon: '/pwa-192x192.png',
    data: { url: 'https://naveen-gr-cse.netlify.app' }
  });

  try {
    await webpush.sendNotification(student.pushSubscription, payload);
  } catch (err) {
    console.error('Push Error:', err);
    if (err.statusCode === 410) {
      student.pushSubscription = null;
      await student.save();
    }
  }
};

module.exports = { sendPushNotification };