import express from "express"
import nodemailer from "nodemailer"
import cors from "cors"
import "dotenv/config"

const app = express()
const SERVICE_NAME = "DEV TITAN mail server"
const DEFAULT_PORT = 3001
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10)
const PORT = Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort
const MAIL_USER = process.env.EMAIL_USER ?? "anietocieco@gmail.com"
const MAIL_PASS = process.env.EMAIL_PASS
const HAS_MAIL_CREDENTIALS = Boolean(MAIL_PASS)

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: SERVICE_NAME,
    port: PORT
  })
})

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

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing fields"
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
      console.log("Local mail preview:", info.message)
    }

    res.json({
      success: true,
      message: HAS_MAIL_CREDENTIALS
        ? "Email sent"
        : "Local mail preview generated. Add EMAIL_PASS to send real Gmail messages.",
      preview: !HAS_MAIL_CREDENTIALS
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Email sending failed"
    })

  }
})

async function handlePortInUse() {
  try {
    const response = await fetch(`http://localhost:${PORT}/`)
    const data = await response.json()

    if (data?.service === SERVICE_NAME) {
      console.log(`Mail server is already running on http://localhost:${PORT}`)
      process.exit(0)
    }
  } catch {
    // Ignore probe failures and fall back to a generic port conflict message.
  }

  console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`)
  process.exit(1)
}

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    void handlePortInUse()
    return
  }

  console.error(error)
  process.exit(1)
})
