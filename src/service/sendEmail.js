import nodemailer from "nodemailer";
export async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: to || process.env.EMAIL,
    subject: subject || "Hello",
    html: html || "<h1>Hello</h1>",
  });
  if (info.accepted.length == 0) {
    return false;
  }
  return true;
}