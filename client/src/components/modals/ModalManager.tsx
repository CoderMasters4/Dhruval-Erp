'use client'

import React from 'react'
import { useModal } from '@/components/providers/ModalProvider'

// Import all modal components
import { CreateEditModal } from './CreateEditModal'
import { CrudModal } from '@/components/ui/CrudModal'
import CustomerFormModal from '@/components/customers/modals/CustomerFormModal'
import DeleteCustomerModal from '@/components/customers/modals/DeleteCustomerModal'
import CustomerDetailsModal from '@/components/customers/modals/CustomerDetailsModal'
import UserFormModal from '@/components/users/modals/UserFormModal'
import VehicleFormModal from '@/components/vehicles/modals/VehicleFormModal'
import CustomerVisitFormModal from '@/components/hospitality/modals/CustomerVisitFormModal'

export const ModalManager: React.FC = () => {
  const { isOpen, modalType, modalProps, closeModal } = useModal()

  if (!isOpen || !modalType) return null

  const renderModal = () => {
    switch (modalType) {
      case 'CREATE_EDIT':
        return (
          <CreateEditModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'CRUD':
        return (
          <CrudModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'CUSTOMER_FORM':
        return (
          <CustomerFormModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'DELETE_CUSTOMER':
        return (
          <DeleteCustomerModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'CUSTOMER_DETAILS':
        return (
          <CustomerDetailsModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'USER_FORM':
        return (
          <UserFormModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'VEHICLE_FORM':
        return (
          <VehicleFormModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      case 'CUSTOMER_VISIT_FORM':
        return (
          <CustomerVisitFormModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
        )
      
      default:
        console.warn(`Unknown modal type: ${modalType}`)
        return null
    }
  }

  return <>{renderModal()}</>
}
