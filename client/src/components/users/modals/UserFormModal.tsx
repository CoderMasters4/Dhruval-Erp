import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
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
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal'
import {
  User as UserType,
  useCreateUserMutation,
  useUpdateUserMutation
} from '@/lib/features/users/usersApi'
import { useGetAllCompaniesQuery } from '@/lib/features/companies/companiesApi'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserType
}

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  middleName: string
  phone: string
  alternatePhone: string
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other' | ''
  primaryCompanyId: string
  role: string
  department: string
  designation: string
  isActive: boolean
  isSuperAdmin: boolean
  // Permissions
  permissions: {
    [module: string]: {
      [action: string]: boolean
    }
  }
}

// Department options
const DEPARTMENTS = [
  { value: 'Management', label: 'Management' },
  { value: 'Production', label: 'Production' },
  { value: 'Sales', label: 'Sales & Marketing' },
  { value: 'Purchase', label: 'Purchase & Procurement' },
  { value: 'Accounts', label: 'Accounts & Finance' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'Quality', label: 'Quality Control' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Security', label: 'Security' },
  { value: 'IT', label: 'Information Technology' }
]

// Role options
const ROLES = [
  { value: 'user', label: 'User', description: 'Basic user with limited access' },
  { value: 'manager', label: 'Manager', description: 'Department manager with team access' },
  { value: 'admin', label: 'Admin', description: 'System administrator with full access' },
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access across all companies' }
]

// Permission presets for different roles
const PERMISSION_PRESETS: { [key: string]: { [module: string]: { [action: string]: boolean } } } = {
  user: {
    inventory: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
    production: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false, startProcess: false, qualityCheck: false },
    orders: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false, dispatch: false },
    financial: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false, bankTransactions: false },
    security: { gateManagement: false, visitorManagement: false, vehicleTracking: false, cctvAccess: false, emergencyResponse: false },
    hr: { viewEmployees: false, manageAttendance: false, manageSalary: false, viewReports: false },
    admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
  },
  manager: {
    inventory: { view: true, create: true, edit: true, delete: false, approve: false, viewReports: true },
    production: { view: true, create: true, edit: true, delete: false, approve: false, viewReports: true, startProcess: true, qualityCheck: true },
    orders: { view: true, create: true, edit: true, delete: false, approve: false, viewReports: true, dispatch: true },
    financial: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: true, bankTransactions: false },
    security: { gateManagement: false, visitorManagement: false, vehicleTracking: false, cctvAccess: false, emergencyResponse: false },
    hr: { viewEmployees: true, manageAttendance: true, manageSalary: false, viewReports: true },
    admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
  },
  admin: {
    inventory: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true },
    production: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, startProcess: true, qualityCheck: true },
    orders: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, dispatch: true },
    financial: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, bankTransactions: true },
    security: { gateManagement: true, visitorManagement: true, vehicleTracking: true, cctvAccess: true, emergencyResponse: true },
    hr: { viewEmployees: true, manageAttendance: true, manageSalary: true, viewReports: true },
    admin: { userManagement: true, systemSettings: true, backupRestore: true, auditLogs: true }
  },
  super_admin: {
    inventory: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true },
    production: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, startProcess: true, qualityCheck: true },
    orders: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, dispatch: true },
    financial: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, bankTransactions: true },
    security: { gateManagement: true, visitorManagement: true, vehicleTracking: true, cctvAccess: true, emergencyResponse: true },
    hr: { viewEmployees: true, manageAttendance: true, manageSalary: true, viewReports: true },
    admin: { userManagement: true, systemSettings: true, backupRestore: true, auditLogs: true }
  }
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    primaryCompanyId: '',
    role: 'user',
    department: '',
    designation: '',
    isActive: true,
    isSuperAdmin: false,
    permissions: PERMISSION_PRESETS.user
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  // Fetch companies for selection
  const { data: companiesResponse, isLoading: companiesLoading } = useGetAllCompaniesQuery()
  const companies = companiesResponse?.data || []

  const isEditing = !!user
  const isLoading = isCreating || isUpdating

  // Helper function to get user ID
  const getUserId = (user: UserType) => user.id || user._id

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          firstName: user.personalInfo?.firstName || '',
          lastName: user.personalInfo?.lastName || '',
          middleName: user.personalInfo?.middleName || '',
          phone: user.personalInfo?.phone || '',
          alternatePhone: user.personalInfo?.alternatePhone || '',
          dateOfBirth: user.personalInfo?.dateOfBirth || '',
          gender: user.personalInfo?.gender || '',
          primaryCompanyId: user.primaryCompanyId || user.companyAccess?.[0]?.companyId || '',
          role: user.companyAccess?.[0]?.role || user.role || 'user',
          department: user.department || '',
          designation: user.designation || '',
          isActive: user.isActive ?? true,
          isSuperAdmin: user.isSuperAdmin || false,
          permissions: user.companyAccess?.[0]?.permissions || PERMISSION_PRESETS.user
        })
      } else {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          middleName: '',
          phone: '',
          alternatePhone: '',
          dateOfBirth: '',
          gender: '',
          primaryCompanyId: '',
          role: 'user',
          department: '',
          designation: '',
          isActive: true,
          isSuperAdmin: false,
          permissions: PERMISSION_PRESETS.user
        })
      }
      setErrors({})
    }
  }, [user, isOpen])

  // Set default company when companies are loaded and no user is being edited
  useEffect(() => {
    if (!user && companies.length > 0 && !formData.primaryCompanyId) {
      setFormData(prev => ({
        ...prev,
        primaryCompanyId: companies[0]?._id || ''
      }))
    }
  }, [companies, user, formData.primaryCompanyId])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[+]?[1-9][\d\s\-\(\)]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
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

    if (!formData.primaryCompanyId && !formData.isSuperAdmin) {
      newErrors.primaryCompanyId = 'Company selection is required'
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
        const updatePayload = {
          id: getUserId(user),
          user: {
            username: formData.username,
            email: formData.email,
            personalInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              phone: formData.phone,
              alternatePhone: formData.alternatePhone,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              displayName: `${formData.firstName} ${formData.lastName}`
            },
            primaryCompanyId: formData.primaryCompanyId,
            companyAccess: formData.primaryCompanyId ? [{
              companyId: formData.primaryCompanyId,
              role: formData.role,
              department: formData.department,
              designation: formData.designation,
              permissions: formData.permissions,
              isActive: true,
              joinedAt: new Date().toISOString()
            }] : [],
            isActive: formData.isActive,
            isSuperAdmin: formData.isSuperAdmin
          }
        }
        console.log('Update user payload:', updatePayload)
        await updateUser(updatePayload).unwrap()
        toast.success('User updated successfully!')
      } else {
        const createPayload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            phone: formData.phone,
            alternatePhone: formData.alternatePhone,
            dateOfBirth: formData.dateOfBirth || undefined,
            gender: formData.gender || undefined,
            displayName: `${formData.firstName} ${formData.lastName}`
          },
          primaryCompanyId: formData.primaryCompanyId,
          companyAccess: formData.primaryCompanyId ? [{
            companyId: formData.primaryCompanyId,
            role: formData.role,
            department: formData.department,
            designation: formData.designation,
            permissions: formData.permissions,
            isActive: true,
            joinedAt: new Date().toISOString()
          }] : [],
          isSuperAdmin: formData.isSuperAdmin,
          // Legacy fields for backward compatibility
          role: formData.role,
          department: formData.department,
          designation: formData.designation
        }
        console.log('Create user payload:', createPayload)
        await createUser(createPayload).unwrap()
        toast.success('User created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error(`${isEditing ? 'Update' : 'Create'} user error:`, error)

      // Handle different types of errors
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} user`

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.data?.error) {
        errorMessage = error.data.error
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.'
      } else if (error?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.'
      } else if (error?.status === 409) {
        errorMessage = 'Username or email already exists.'
      }

      toast.error(errorMessage)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates }
      
      // If role changes, apply permission preset
      if (updates.role && updates.role !== prev.role) {
        const preset = PERMISSION_PRESETS[updates.role as keyof typeof PERMISSION_PRESETS]
        if (preset) {
          newData.permissions = preset
        }
      }
      
      return newData
    })
    
    // Clear related errors
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key as keyof FormData]
    })
    setErrors(newErrors)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit User' : 'Create New User'}
      subtitle={isEditing ? 'Update user information' : 'Add a new user to the system'}
      size="lg"
    >
      <ModalContent>
        <form id="user-form" onSubmit={handleSubmit}>
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
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => updateFormData({ username: e.target.value.toLowerCase() })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => updateFormData({ firstName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => updateFormData({ lastName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.lastName}</p>
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
                      onChange={(e) => updateFormData({ email: e.target.value.toLowerCase() })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
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
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => updateFormData({ department: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white text-gray-900 font-medium appearance-none"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => updateFormData({ designation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                    placeholder="Enter designation"
                  />
                </div>
              </div>
            </div>

            {/* Company Assignment */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Company Assignment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Primary Company *
                  </label>
                  <select
                    required
                    value={formData.primaryCompanyId}
                    onChange={(e) => updateFormData({ primaryCompanyId: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white text-gray-900 font-medium ${
                      errors.primaryCompanyId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={companiesLoading}
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.companyName} ({company.companyCode})
                      </option>
                    ))}
                  </select>
                  {errors.primaryCompanyId && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.primaryCompanyId}</p>
                  )}
                  {companiesLoading && (
                    <p className="mt-1 text-xs text-gray-500">Loading companies...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData({ gender: e.target.value as 'Male' | 'Female' | 'Other' | '' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white text-gray-900 font-medium"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white text-gray-900 font-medium"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {ROLES.find(r => r.value === formData.role)?.description}
                  </p>
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

                {/* Super Admin Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Super Admin Privileges
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSuperAdmin}
                        onChange={(e) => updateFormData({ isSuperAdmin: e.target.checked })}
                        className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Grant Super Admin Access
                      </span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Super Admin users have full access to all companies and system settings
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Access & Permissions
              </h3>
              
              <div className="space-y-6">
                {/* Role-based Permission Presets */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Role Preset</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Select a role to automatically apply permission presets, or customize individual permissions below.
                  </p>
                  <select
                    value={formData.role}
                    onChange={(e) => updateFormData({ role: e.target.value as UserType['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                  
                  {/* Permission Summary */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Permission Summary:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${formData.permissions.inventory.view ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span>Inventory: {formData.permissions.inventory.view ? 'View' : 'No Access'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${formData.permissions.production.view ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span>Production: {formData.permissions.production.view ? 'View' : 'No Access'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${formData.permissions.orders.view ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span>Orders: {formData.permissions.orders.view ? 'View' : 'No Access'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${formData.permissions.hr.viewEmployees ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span>HR: {formData.permissions.hr.viewEmployees ? 'View' : 'No Access'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-700 mb-2">Quick Actions:</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateFormData({ permissions: PERMISSION_PRESETS.user })}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200 transition-colors"
                      >
                        Reset to User
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData({ permissions: PERMISSION_PRESETS.manager })}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200 transition-colors"
                      >
                        Set Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData({ permissions: PERMISSION_PRESETS.admin })}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200 transition-colors"
                      >
                        Set Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const allPermissions = {
                            inventory: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true },
                            production: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, startProcess: true, qualityCheck: true },
                            orders: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, dispatch: true },
                            financial: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, bankTransactions: true },
                            security: { gateManagement: true, visitorManagement: true, vehicleTracking: true, cctvAccess: true, emergencyResponse: true },
                            hr: { viewEmployees: true, manageAttendance: true, manageSalary: true, viewReports: true },
                            admin: { userManagement: true, systemSettings: true, backupRestore: true, auditLogs: true }
                          }
                          updateFormData({ permissions: allPermissions })
                        }}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-300 hover:bg-green-200 transition-colors"
                      >
                        All Permissions
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory Permissions */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Inventory Management</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.view}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, view: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">View</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.create}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, create: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Create</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.edit}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, edit: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Edit</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.delete}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, delete: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Delete</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.approve}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, approve: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Approve</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.inventory.viewReports}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            inventory: { ...formData.permissions.inventory, viewReports: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Reports</span>
                    </label>
                  </div>
                </div>

                {/* Production Permissions */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Production Management</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.production.view}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            production: { ...formData.permissions.production, view: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">View</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.production.create}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            production: { ...formData.permissions.production, create: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Create</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.production.startProcess}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            production: { ...formData.permissions.production, startProcess: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Start Process</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.production.qualityCheck}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            production: { ...formData.permissions.production, qualityCheck: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Quality Check</span>
                    </label>
                  </div>
                </div>

                {/* HR Permissions */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Human Resources</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.hr.viewEmployees}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            hr: { ...formData.permissions.hr, viewEmployees: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">View Employees</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.hr.manageAttendance}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            hr: { ...formData.permissions.hr, manageAttendance: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Manage Attendance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.hr.viewReports}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            hr: { ...formData.permissions.hr, viewReports: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">View Reports</span>
                    </label>
                  </div>
                </div>

                {/* Admin Permissions */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">System Administration</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.admin.userManagement}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            admin: { ...formData.permissions.admin, userManagement: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">User Management</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.admin.systemSettings}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            admin: { ...formData.permissions.admin, systemSettings: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">System Settings</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.admin.auditLogs}
                        onChange={(e) => updateFormData({
                          permissions: {
                            ...formData.permissions,
                            admin: { ...formData.permissions.admin, auditLogs: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Audit Logs</span>
                    </label>
                  </div>
                </div>
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
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
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
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 ${
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

        </form>
      </ModalContent>

      <ModalFooter>
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
          form="user-form"
          disabled={isLoading}
          className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
