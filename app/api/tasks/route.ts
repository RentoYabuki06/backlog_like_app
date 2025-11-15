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
  const projectId = searchParams.get("projectId")

  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId && { projectId }),
      project: {
        userId: session.user.id,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      order: "asc",
    },
  })

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    projectId,
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    estimatedHours,
  } = body

  if (!projectId || !title) {
    return NextResponse.json(
      { error: "ProjectId and title are required" },
      { status: 400 }
    )
  }

  // プロジェクトの所有権を確認
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
    },
    include: {
      project: true,
    },
  })

  return NextResponse.json(task, { status: 201 })
}

