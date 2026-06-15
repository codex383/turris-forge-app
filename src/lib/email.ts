import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_r6zzqqd";
const TEMPLATE_ID = "template_620qu2x";
const PUBLIC_KEY = "Ndjq0OqcRaLB9jJB2";

emailjs.init(PUBLIC_KEY);

export const sendEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  message: string
): Promise<void> => {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: toEmail,
    to_name: toName,
    subject,
    message,
  });
};
