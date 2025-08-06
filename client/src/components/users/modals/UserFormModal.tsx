import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  User as UserType, 
  useCreateUserMutation, 
  useUpdateUserMutation 
} from '@/lib/features/users/usersApi'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserType
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserType['role']
  phone: string
  department: string
  isActive: boolean
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    department: '',
    isActive: true
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const isEditing = !!user
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'user',
        phone: user.phone || '',
        department: user.department || '',
        isActive: user.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        phone: '',
        department: '',
        isActive: true
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isEditing && user) {
        await updateUser({
          id: user._id,
          user: {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            phone: formData.phone || undefined,
            department: formData.department || undefined,
            isActive: formData.isActive
          }
        }).unwrap()
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || undefined,
          department: formData.department || undefined
        }).unwrap()
      }
      
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key as keyof FormData]
    })
    setErrors(newErrors)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-sky-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit User' : 'Create New User'}
                </h2>
                <p className="text-sky-100">
                  {isEditing ? 'Update user information' : 'Add a new user to the system'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors bg-transparent border-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-sky-50 rounded-xl p-6 border border-sky-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-sky-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => updateFormData({ department: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Status */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Role & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => updateFormData({ role: e.target.value as UserType['role'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-4 pt-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          checked={formData.isActive}
                          onChange={() => updateFormData({ isActive: true })}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-green-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          checked={!formData.isActive}
                          onChange={() => updateFormData({ isActive: false })}
                          className="mr-2 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-red-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password Section (only for new users) */}
            {!isEditing && (
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-yellow-600" />
                  Security
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => updateFormData({ password: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
