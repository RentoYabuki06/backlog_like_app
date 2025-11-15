import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: session.user.id,
      ...(startDate && {
        startTime: {
          gte: new Date(startDate),
        },
      }),
      ...(endDate && {
        endTime: {
          lte: new Date(endDate),
        },
      }),
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
      project: true,
    },
    orderBy: {
      startTime: "asc",
    },
  })

  return NextResponse.json(events)
}

