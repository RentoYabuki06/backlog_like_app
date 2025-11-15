"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  estimatedHours: number | null
  actualHours: number
}

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  tasks: Task[]
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    estimatedHours: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProject()
    }
  }, [session])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id as string}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        router.push("/projects")
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      router.push("/projects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskFormData,
          projectId: params.id as string,
        }),
      })

      if (response.ok) {
        setTaskFormData({
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: "",
          estimatedHours: "",
        })
        setShowTaskModal(false)
        fetchProject()
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("このタスクを削除してもよろしいですか？")) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      TODO: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      DONE: "bg-green-100 text-green-800",
      ON_HOLD: "bg-yellow-100 text-yellow-800",
    }
    return styles[status as keyof typeof styles] || styles.TODO
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-red-100 text-red-800",
    }
    return styles[priority as keyof typeof styles] || styles.MEDIUM
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "ON_HOLD":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const tasksByStatus = {
    TODO: project.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
    ON_HOLD: project.tasks.filter((t) => t.status === "ON_HOLD"),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div
              className="w-6 h-6 rounded-full mr-3"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-gray-600 ml-9">{project.description}</p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">合計: </span>
              <span className="font-semibold">{project.tasks.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">完了: </span>
              <span className="font-semibold">{tasksByStatus.DONE.length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            新規タスク
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(tasksByStatus).map(([status, tasks]) => (
            <div key={status} className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {status === "TODO"
                  ? "未着手"
                  : status === "IN_PROGRESS"
                  ? "進行中"
                  : status === "DONE"
                  ? "完了"
                  : "保留"}
                <span className="ml-2 text-gray-500">({tasks.length})</span>
              </h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">
                        {task.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority === "HIGH"
                          ? "高"
                          : task.priority === "MEDIUM"
                          ? "中"
                          : "低"}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          期限: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTaskStatus(task.id, e.target.value)
                      }
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="TODO">未着手</option>
                      <option value="IN_PROGRESS">進行中</option>
                      <option value="DONE">完了</option>
                      <option value="ON_HOLD">保留</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">新規タスク作成</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タスク名 *
                </label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    優先度
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">低</option>
                    <option value="MEDIUM">中</option>
                    <option value="HIGH">高</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODO">未着手</option>
                    <option value="IN_PROGRESS">進行中</option>
                    <option value="DONE">完了</option>
                    <option value="ON_HOLD">保留</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期限
                </label>
                <input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  見積もり時間（時間）
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={taskFormData.estimatedHours}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      estimatedHours: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

