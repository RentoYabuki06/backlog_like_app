"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Calendar as CalendarIcon, RefreshCw, Clock } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns"
import { ja } from "date-fns/locale"

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  duration: number
  task?: {
    title: string
    project: {
      name: string
      color: string
    }
  }
  project?: {
    name: string
    color: string
  }
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEvents()
    }
  }, [session, currentDate])

  const fetchEvents = async () => {
    try {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      const response = await fetch(
        `/api/calendar/events?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = new Date()
      
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchEvents()
      } else {
        alert("同期に失敗しました")
      }
    } catch (error) {
      console.error("Failed to sync:", error)
      alert("同期中にエラーが発生しました")
    } finally {
      setSyncing(false)
    }
  }

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { locale: ja })
    const endDate = endOfWeek(monthEnd, { locale: ja })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.startTime)
      return isSameDay(eventDate, date)
    })
  }

  const getTotalHoursForDay = (date: Date) => {
    const dayEvents = getEventsForDay(date)
    return dayEvents.reduce((total, event) => total + event.duration, 0)
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : []

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

  const days = getDaysInMonth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">カレンダー</h1>
              <p className="text-gray-600">Googleカレンダーとの連携</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "同期中..." : "Googleカレンダーと同期"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentDate(addDays(currentDate, -30))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                前月
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, "yyyy年 M月", { locale: ja })}
              </h2>
              <button
                onClick={() => setCurrentDate(addDays(currentDate, 30))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                次月
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 pb-2"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day)
                const totalHours = getTotalHoursForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg text-sm transition-colors
                      ${!isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                      ${isToday ? "bg-blue-100 font-bold" : ""}
                      ${isSelected ? "ring-2 ring-blue-500" : ""}
                      ${dayEvents.length > 0 ? "bg-green-50" : ""}
                      hover:bg-gray-100
                    `}
                  >
                    <div>{format(day, "d")}</div>
                    {totalHours > 0 && (
                      <div className="text-xs text-blue-600 font-semibold">
                        {totalHours.toFixed(1)}h
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate
                ? format(selectedDate, "M月d日（E）", { locale: ja })
                : "日付を選択"}
            </h3>
            
            {selectedDate && selectedDayEvents.length === 0 && (
              <p className="text-gray-500 text-sm">イベントがありません</p>
            )}

            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {(event.task?.project || event.project) && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            event.task?.project.color || event.project?.color,
                        }}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(parseISO(event.startTime), "HH:mm")} -{" "}
                      {format(parseISO(event.endTime), "HH:mm")}
                      <span className="ml-2">({event.duration.toFixed(1)}時間)</span>
                    </div>
                    {(event.task || event.project) && (
                      <div className="text-xs">
                        プロジェクト:{" "}
                        {event.task?.project.name || event.project?.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            今月のサマリー
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500">総イベント数</div>
              <div className="text-2xl font-bold text-gray-900">
                {events.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">総作業時間</div>
              <div className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + e.duration, 0).toFixed(1)} 時間
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">1日平均</div>
              <div className="text-2xl font-bold text-gray-900">
                {events.length > 0
                  ? (
                      events.reduce((sum, e) => sum + e.duration, 0) /
                      new Set(
                        events.map((e) =>
                          format(parseISO(e.startTime), "yyyy-MM-dd")
                        )
                      ).size
                    ).toFixed(1)
                  : "0.0"}{" "}
                時間
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

