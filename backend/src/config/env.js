export const env = {
  port: process.env.PORT || 8080,

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,

  WHAPI_TOKEN: process.env.WHAPI_TOKEN,
  WHAPI_URL: process.env.WHAPI_URL,

  BREVO_SMTP: process.env.BREVO_SMTP,
  BREVO_API: process.env.BREVO_API,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};