'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Calendar, Truck, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createPayment } from '@/app/(dashboard)/payments/actions'
import type { TripWithRelations } from '@/types/db'

interface PaymentPopupProps {
  trip: TripWithRelations
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentPopup({ trip, isOpen, onClose, onSuccess }: PaymentPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [amount, setAmount] = useState('')

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('')
      setAmount('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      formData.append('trip_id', trip.id)
      await createPayment(formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Payment creation failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return '💵'
      case 'UPI': return '📱'
      case 'BANK': return '🏦'
      case 'OTHER': return '💳'
      default: return '💰'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] m-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[100vh] overflow-hidden m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Record Payment</h2>
                <p className="text-blue-100 text-sm">Add payment for this trip</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Trip Summary Card */}
          <Card className="mb-6 border-2 border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(trip.trip_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Truck</p>
                    <p className="font-medium">{trip.truck?.truck_no}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Center</p>
                    <p className="font-medium">{trip.center_city || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Consignee</p>
                    <p className="font-medium">{trip.consignee1?.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg">{formatCurrency(trip.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Received</p>
                    <p className="font-bold text-lg text-green-600">{formatCurrency(trip.amount_received)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance Due</p>
                    <p className="font-bold text-lg text-red-600">{formatCurrency(trip.balance_due)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form action={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date" className="text-sm font-medium">Payment Date *</Label>
                <Input
                  type="date"
                  name="payment_date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <Input
                    type="number"
                    name="amount"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={trip.balance_due}
                    className="pl-10 h-11 text-lg font-semibold"
                    required
                  />
                </div>
                {amount && parseFloat(amount) > trip.balance_due && (
                  <p className="text-xs text-red-500">Amount exceeds balance due</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method" className="text-sm font-medium">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="CASH">
                    <div className="flex items-center gap-2">
                      <span>💵</span>
                      <span>Cash Payment</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="UPI">
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span>UPI Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="BANK">
                    <div className="flex items-center gap-2">
                      <span>🏦</span>
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="OTHER">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>Other Method</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="method" value={paymentMethod} />
            </div>

            {(paymentMethod === 'UPI' || paymentMethod === 'BANK') && (
              <div className="space-y-2">
                <Label htmlFor="reference_no" className="text-sm font-medium">Transaction Reference</Label>
                <Input
                  name="reference_no"
                  placeholder="Enter transaction ID or reference number"
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
              <Input
                name="notes"
                placeholder="Add any additional notes"
                className="h-11"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !amount || parseFloat(amount) > trip.balance_due} 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                )}
                {isSubmitting ? 'Processing...' : `Record Payment ${amount ? formatCurrency(parseFloat(amount)) : ''}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}