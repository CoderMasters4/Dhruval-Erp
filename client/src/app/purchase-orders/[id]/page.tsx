'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/lib/features/auth/authSlice'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardHeader } from '@/components/ui/DashboardHeader'
import { ResponsiveGrid } from '@/components/ui/ResponsiveLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
    useGetPurchaseOrderByIdQuery,
    useUpdatePurchaseOrderMutation,
    useDeletePurchaseOrderMutation
} from '@/lib/api/purchaseOrdersApi'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Download,
    Printer,
    Share2,
    Calendar,
    User,
    Package,
    CreditCard,
    Truck,
    FileText,
    Phone,
    Mail,
    MapPin,
    Clock,
    DollarSign,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Eye,
    Copy,
    ExternalLink,
    Building,
    ShoppingCart
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { OrderDetailsSkeleton } from '@/components/ui/OrderDetailsSkeleton'

export default function PurchaseOrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const user = useSelector(selectCurrentUser)
    const orderId = params.id as string

    const [showEditModal, setShowEditModal] = useState(false)

    // RTK Query hooks
    const {
        data: orderData,
        isLoading,
        error,
        refetch: refetchOrder
    } = useGetPurchaseOrderByIdQuery(orderId)

    // Mutations
    const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation()
    const [deletePurchaseOrder] = useDeletePurchaseOrderMutation()

    const order = orderData?.data

    // Helper functions
    const getSupplierName = () => {
        if (!order) return 'N/A'
        
        if (order.supplier && typeof order.supplier === 'object') {
            return order.supplier.supplierName || 'N/A'
        }
        
        return 'N/A'
    }

    const getSupplierCode = () => {
        if (!order) return 'N/A'
        
        if (order.supplier && typeof order.supplier === 'object') {
            return order.supplier.supplierCode || 'N/A'
        }
        
        return 'N/A'
    }

    const getSupplierPhone = () => {
        if (!order) return null
        
        if (order.supplier && typeof order.supplier === 'object' && order.supplier.contactInfo) {
            return order.supplier.contactInfo.phone || null
        }
        
        return null
    }

    const getSupplierEmail = () => {
        if (!order) return null
        
        if (order.supplier && typeof order.supplier === 'object' && order.supplier.contactInfo) {
            return order.supplier.contactInfo.email || null
        }
        
        return null
    }

    const getSupplierAddress = () => {
        if (!order) return null
        
        // Check if supplier has address information (if it exists in the actual data)
        if (order.supplier && typeof order.supplier === 'object' && 'address' in order.supplier) {
            const addr = (order.supplier as any).address
            if (typeof addr === 'string') return addr
            
            if (typeof addr === 'object' && addr) {
                const addressParts = [
                    addr.addressLine1,
                    addr.addressLine2,
                    addr.city,
                    addr.state,
                    addr.pincode,
                    addr.country
                ].filter(Boolean)
                
                return addressParts.length > 0 ? addressParts.join(', ') : null
            }
        }
        
        return null
    }

    const getDeliveryAddress = () => {
        if (!order) return null
        
        if (order.deliveryAddress) {
            const addr = order.deliveryAddress
            const addressParts = [
                addr.addressLine1,
                addr.addressLine2,
                addr.city,
                addr.state,
                addr.pincode,
                addr.country
            ].filter(Boolean)
            
            return addressParts.length > 0 ? addressParts.join(', ') : null
        }
        
        return null
    }

    // Handler functions
    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updatePurchaseOrder({ orderId, orderData: { status: newStatus } }).unwrap()
            toast.success(`Order status updated to ${newStatus}!`)
            refetchOrder()
        } catch (error) {
            toast.error('Failed to update order status!')
        }
    }

    const handleDeleteOrder = async () => {
        if (confirm('Are you sure you want to delete this purchase order?')) {
            try {
                await deletePurchaseOrder(orderId).unwrap()
                toast.success('Purchase order deleted successfully!')
                router.push('/purchase-orders')
            } catch (error) {
                toast.error('Failed to delete purchase order!')
            }
        }
    }

    const handleCopyOrderId = () => {
        navigator.clipboard.writeText(order?.orderNumber || orderId)
        toast.success('Order ID copied to clipboard!')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'received':
                return 'bg-green-100 text-green-800'
            case 'confirmed':
            case 'approved':
                return 'bg-blue-100 text-blue-800'
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'overdue':
                return 'bg-red-100 text-red-800'
            case 'partial':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'received':
                return <CheckCircle className="h-4 w-4" />
            case 'pending':
                return <Clock className="h-4 w-4" />
            case 'cancelled':
                return <XCircle className="h-4 w-4" />
            case 'shipped':
                return <Truck className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    if (isLoading) {
        return (
            <AppLayout>
                <ResponsiveGrid>
                    <Breadcrumb
                        items={[
                            { label: 'Purchase', href: '/purchase' },
                            { label: 'Orders', href: '/purchase-orders' },
                            { label: 'Loading...', current: true }
                        ]}
                        className="mb-4"
                    />
                    <OrderDetailsSkeleton />
                </ResponsiveGrid>
            </AppLayout>
        )
    }

    if (error || !order) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <XCircle className="h-16 w-16 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Order Not Found</h2>
                    <p className="text-gray-600">The purchase order you're looking for doesn't exist or has been deleted.</p>
                    <Button onClick={() => router.push('/purchase-orders')} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <ResponsiveGrid>
                <Breadcrumb
                    items={[
                        { label: 'Purchase', href: '/purchase' },
                        { label: 'Orders', href: '/purchase-orders' },
                        { label: `PO #${order?.orderNumber || orderId}`, current: true }
                    ]}
                    className="mb-4"
                />

                <DashboardHeader
                    title={`PO #${order.orderNumber}`}
                    description={`Purchase order details for ${getSupplierName()}`}
                    icon={<ShoppingCart className="h-6 w-6 text-white" />}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button onClick={() => router.push('/purchase-orders')} variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button onClick={() => window.print()} variant="outline" size="sm">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Button onClick={handleCopyOrderId} variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy ID
                            </Button>
                        </div>
                    }
                />

                <div className="space-y-6">
                    {/* Order Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Order Status */}
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Order Status</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {getStatusIcon(order.status)}
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-200 rounded-full">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items Count */}
                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Items Count</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Package className="h-4 w-4" />
                                            <span className="text-2xl font-bold text-green-900">
                                                {order.items?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-200 rounded-full">
                                        <Package className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Amount */}
                        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Total Amount</p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {formatCurrency(order.totalAmount || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-200 rounded-full">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Date */}
                        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Order Date</p>
                                        <p className="text-sm font-bold text-orange-900">
                                            {formatDate(order.orderDate || order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-200 rounded-full">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Order Details */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Supplier Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Supplier Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                                            <p className="text-lg font-semibold text-gray-900">{getSupplierName()}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Supplier Code</label>
                                            <p className="text-lg font-semibold text-gray-900">{getSupplierCode()}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">PO Number</label>
                                            <p className="text-sm text-gray-900 font-mono">#{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Supplier ID</label>
                                            <p className="text-sm text-gray-900 font-mono">{order.supplierId}</p>
                                        </div>
                                    </div>

                                    {/* Supplier Contact Information */}
                                    {(getSupplierPhone() || getSupplierEmail() || getSupplierAddress()) && (
                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {getSupplierPhone() && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Phone</label>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            <p className="text-gray-900">{getSupplierPhone()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {getSupplierEmail() && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                            <p className="text-gray-900">{getSupplierEmail()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {getSupplierAddress() && (
                                                    <div className="md:col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Address</label>
                                                        <div className="flex items-start gap-2 mt-1">
                                                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                                            <p className="text-gray-900">{getSupplierAddress()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Order Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Item
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Quantity
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Unit Price
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {order.items && order.items.length > 0 ? (
                                                    order.items.map((item: any, index: number) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {item.itemName || item.name || `Item ${index + 1}`}
                                                                    </div>
                                                                    {item.itemCode && (
                                                                        <div className="text-sm text-gray-500">Code: {item.itemCode}</div>
                                                                    )}
                                                                    {item.description && (
                                                                        <div className="text-xs text-gray-400">{item.description}</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.quantity || 0}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatCurrency(item.unitPrice || 0)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatCurrency(item.totalPrice || (item.quantity * item.unitPrice) || 0)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                            No items found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Actions */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">
                                            {formatCurrency(order.subtotal || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium">
                                            {formatCurrency(order.taxAmount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="font-medium">
                                            -{formatCurrency(order.discountAmount || 0)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(order.totalAmount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information */}
                            {(order.expectedDeliveryDate || getDeliveryAddress()) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Truck className="h-5 w-5" />
                                            Delivery Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {order.expectedDeliveryDate && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Expected Delivery</label>
                                                <p className="text-gray-900">{formatDate(order.expectedDeliveryDate)}</p>
                                            </div>
                                        )}
                                        {order.actualDeliveryDate && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Actual Delivery</label>
                                                <p className="text-gray-900">{formatDate(order.actualDeliveryDate)}</p>
                                            </div>
                                        )}
                                        {getDeliveryAddress() && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                                                <p className="text-gray-900">{getDeliveryAddress()}</p>
                                            </div>
                                        )}
                                        {order.paymentTerms && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                                                <p className="text-gray-900">{order.paymentTerms}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button 
                                        onClick={() => handleStatusUpdate('ordered')} 
                                        className="w-full" 
                                        variant="outline"
                                        disabled={order.status === 'ordered'}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Mark as Ordered
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate('received')} 
                                        className="w-full" 
                                        variant="outline"
                                        disabled={order.status === 'received'}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Mark as Received
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate('approved')} 
                                        className="w-full" 
                                        variant="outline"
                                        disabled={order.status === 'approved'}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Order
                                    </Button>
                                    <Button 
                                        onClick={handleDeleteOrder} 
                                        className="w-full" 
                                        variant="destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Order
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </ResponsiveGrid>
        </AppLayout>
    )
}