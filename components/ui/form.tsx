import { ReactNode } from "react"

// Form Container
interface FormContainerProps {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
}

export function FormContainer({ children, onSubmit }: FormContainerProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  )
}

// Form Field (Label + Input wrapper)
interface FormFieldProps {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, required, children, className = "" }: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
}

export function Input({ fullWidth = true, className = "", ...props }: InputProps) {
  const baseClasses = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
  const widthClass = fullWidth ? "w-full" : ""
  
  return (
    <input
      {...props}
      className={`${baseClasses} ${widthClass} ${className}`}
    />
  )
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean
}

export function Textarea({ fullWidth = true, className = "", ...props }: TextareaProps) {
  const baseClasses = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
  const widthClass = fullWidth ? "w-full" : ""
  
  return (
    <textarea
      {...props}
      className={`${baseClasses} ${widthClass} ${className}`}
    />
  )
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  fullWidth?: boolean
  options: { value: string; label: string }[]
}

export function Select({ fullWidth = true, className = "", options, ...props }: SelectProps) {
  const baseClasses = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
  const widthClass = fullWidth ? "w-full" : ""
  
  return (
    <select
      {...props}
      className={`${baseClasses} ${widthClass} ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Form Actions (Submit + Cancel buttons)
interface FormActionsProps {
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
}

export function FormActions({
  onCancel,
  submitLabel = "作成",
  cancelLabel = "キャンセル",
  isSubmitting = false,
}: FormActionsProps) {
  return (
    <div className="flex space-x-3 mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "処理中..." : submitLabel}
      </button>
    </div>
  )
}

// Modal
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl text-gray-900 font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}

