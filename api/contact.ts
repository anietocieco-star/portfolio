import nodemailer from "nodemailer"

const SERVICE_NAME = "DEV TITAN mail server"
const MAIL_USER = process.env.EMAIL_USER ?? "anietocieco@gmail.com"
const MAIL_PASS = process.env.EMAIL_PASS
const HAS_MAIL_CREDENTIALS = Boolean(MAIL_PASS)

const transporter = nodemailer.createTransport({
  ...(HAS_MAIL_CREDENTIALS
    ? {
        service: "gmail",
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS
        }
      }
    : {
        jsonTransport: true
      })
})

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function GET() {
  return Response.json({
    status: "ok",
    service: SERVICE_NAME,
    mode: "vercel-function"
  })
}

export async function POST(request: Request) {
  let body: { email?: string; message?: string; name?: string }

  try {
    body = await request.json()
  } catch {
    return Response.json({
      error: "Invalid JSON body"
    }, {
      status: 400
    })
  }

  const { name, email, message } = body

  if (!name || !email || !message) {
    return Response.json({
      error: "Missing fields"
    }, {
      status: 400
    })
  }

  try {
    const safeMessage = escapeHtml(message)

    const info = await transporter.sendMail({
      from: `Maciej Nowakowski <${MAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting me",
      text: `Hi!

Thank you for reaching out through my portfolio.
Your message has been successfully received.

I will review it and get back to you as soon as possible.
If your message is urgent or you would like to add more details, feel free to reply to this email.

Thanks again for your interest and your time.

Best regards
mrtost`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111827;">
          <p>Hi!</p>
          <p>Thank you for reaching out through my portfolio. Your message has been successfully received.</p>
          <p>I will review it and get back to you as soon as possible.</p>
          <p>If your message is urgent or you would like to add more details, feel free to reply to this email.</p>
          <p>Thanks again for your interest and your time.</p>
          <p style="margin-top: 24px;">
            Best regards<br>
            <strong>mrtost</strong>
          </p>
          <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Message received:</p>
          <blockquote style="margin: 0; padding: 12px 16px; background: #f3f4f6; border-left: 4px solid #38bdf8; color: #374151;">
            ${safeMessage}
          </blockquote>
        </div>
      `
    })

    if (!HAS_MAIL_CREDENTIALS) {
      console.log("Vercel mail preview:", info.message)
    }

    return Response.json({
      success: true,
      message: HAS_MAIL_CREDENTIALS
        ? "Email sent"
        : "Local mail preview generated. Add EMAIL_PASS in Vercel to send real Gmail messages.",
      preview: !HAS_MAIL_CREDENTIALS
    })

  } catch (error) {
    console.error(error)

    return Response.json({
      error: "Email sending failed"
    }, {
      status: 500
    })
  }
}
