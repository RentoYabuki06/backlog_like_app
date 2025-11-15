import { google } from "googleapis"
import { prisma } from "./prisma"

export async function getGoogleCalendarClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  })

  if (!account?.access_token) {
    throw new Error("Google account not connected")
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  })

  return google.calendar({ version: "v3", auth: oauth2Client })
}

export async function syncCalendarEvents(userId: string, startDate: Date, endDate: Date) {
  try {
    const calendar = await getGoogleCalendarClient(userId)
    
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = response.data.items || []

    // データベースに保存
    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue

      const startTime = new Date(event.start.dateTime)
      const endTime = new Date(event.end.dateTime)
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // 時間単位

      await prisma.calendarEvent.upsert({
        where: {
          googleEventId: event.id!,
        },
        update: {
          title: event.summary || "無題",
          description: event.description,
          startTime,
          endTime,
          duration,
          syncedAt: new Date(),
        },
        create: {
          userId,
          googleEventId: event.id!,
          title: event.summary || "無題",
          description: event.description,
          startTime,
          endTime,
          duration,
          calendarId: "primary",
        },
      })
    }

    return events.length
  } catch (error) {
    console.error("Failed to sync calendar events:", error)
    throw error
  }
}

