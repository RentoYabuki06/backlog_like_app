import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: {
        userId: session.user.id,
      },
    },
    include: {
      project: true,
      calendarEvents: true,
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    estimatedHours,
    actualHours,
  } = body

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: {
        userId: session.user.id,
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(startDate !== undefined && {
        startDate: startDate ? new Date(startDate) : null,
      }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(estimatedHours !== undefined && {
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      }),
      ...(actualHours !== undefined && {
        actualHours: parseFloat(actualHours),
      }),
    },
    include: {
      project: true,
    },
  })

  return NextResponse.json(updatedTask)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      project: {
        userId: session.user.id,
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  await prisma.task.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

