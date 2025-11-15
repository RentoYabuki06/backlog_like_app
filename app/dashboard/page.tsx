import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import { CheckCircle2, Clock, FolderKanban, TrendingUp } from "lucide-react"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // プロジェクトとタスクのデータを取得
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    include: {
      tasks: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const totalTasks = await prisma.task.count({
    where: {
      project: {
        userId: session.user.id,
      },
    },
  })

  const completedTasks = await prisma.task.count({
    where: {
      project: {
        userId: session.user.id,
      },
      status: "DONE",
    },
  })

  const inProgressTasks = await prisma.task.count({
    where: {
      project: {
        userId: session.user.id,
      },
      status: "IN_PROGRESS",
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">
            プロジェクトとタスクの概要を確認できます
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderKanban className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      プロジェクト数
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {projects.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      進行中のタスク
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {inProgressTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      完了したタスク
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {completedTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      総タスク数
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {totalTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* プロジェクト一覧 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                最近のプロジェクト
              </h2>
              <a
                href="/projects"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                すべて見る →
              </a>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  プロジェクトがありません
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  最初のプロジェクトを作成してタスク管理を始めましょう
                </p>
                <div className="mt-6">
                  <a
                    href="/projects"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    プロジェクトを作成
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <a
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{project._count.tasks} タスク</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

