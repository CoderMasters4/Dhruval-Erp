'use client'

import { useModal } from '@/components/providers/ModalProvider'

export const useModals = () => {
  const { openModal, closeModal } = useModal()

  return {
    // Generic modals
    openCreateEditModal: (props: any) => openModal('CREATE_EDIT', props),
    openCrudModal: (props: any) => openModal('CRUD', props),
    
    // Customer modals
    openCustomerForm: (props: any) => openModal('CUSTOMER_FORM', props),
    openDeleteCustomer: (props: any) => openModal('DELETE_CUSTOMER', props),
    openCustomerDetails: (props: any) => openModal('CUSTOMER_DETAILS', props),
    
    // User modals
    openUserForm: (props: any) => openModal('USER_FORM', props),
    
    // Vehicle modals
    openVehicleForm: (props: any) => openModal('VEHICLE_FORM', props),
    
    // Hospitality modals
    openCustomerVisitForm: (props: any) => openModal('CUSTOMER_VISIT_FORM', props),
    
    // Close modal
    closeModal
  }
}
