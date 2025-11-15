import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncCalendarEvents } from "@/lib/google-calendar"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { startDate, endDate } = body

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30日前
    const end = endDate ? new Date(endDate) : new Date()

    const count = await syncCalendarEvents(session.user.id, start, end)

    return NextResponse.json({
      success: true,
      syncedCount: count,
      message: `${count}件のイベントを同期しました`,
    })
  } catch (error: any) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: error.message || "同期に失敗しました" },
      { status: 500 }
    )
  }
}

