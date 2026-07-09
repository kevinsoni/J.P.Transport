'use client'

import { useState, useRef } from 'react'
import { Plus, Minus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { createTrip, updateTrip } from '@/app/(dashboard)/trips/actions'
import { createParty, deleteParty } from '@/app/(dashboard)/parties/actions'
import { createTruck, deleteTruck } from '@/app/(dashboard)/trucks/actions'
import { Truck, Party, Trip } from '@/types/db'
import { cn } from '@/lib/utils'

type ExtraChargeRow = { id: string; label: string; amount: number; sign: '+' | '-'; include: boolean }

const newRowId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `row-${Math.random().toString(36).slice(2)}`

type TruckWithOwner = Truck & {
  owner: { name: string }[] | null
}

interface TripFormProps {
  trucks: TruckWithOwner[]
  parties: Party[]
  editData?: any
  tripId?: string
}

export function TripForm({ trucks, parties, editData, tripId }: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [partiesList, setPartiesList] = useState(parties)
  const [trucksList, setTrucksList] = useState(trucks)
  const [selectedParties, setSelectedParties] = useState({
    consignor_id: editData?.consignor_id || '',
    consignor2_id: editData?.consignor2_id || '',
    consignee1_id: editData?.consignee1_id || '',
    settlement_party_id: editData?.settlement_party_id || ''
  })
  const [selectedTruck, setSelectedTruck] = useState(editData?.truck_id || '')
  const [selectedDate, setSelectedDate] = useState(editData?.trip_date || new Date().toISOString().split('T')[0])

  const getDayName = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }
  const [amounts, setAmounts] = useState({
    rate: editData?.rate || 0,
    payment_weight: editData?.payment_weight || 0,
    tp_charge_consignor1: editData?.tp_charge_consignor1 || 0,
    tp_charge_consignor2: editData?.tp_charge_consignor2 || 0,
    rto_charge_gujarat: editData?.rto_charge_gujarat || 0,
    rto_charge_maharashtra: editData?.rto_charge_maharashtra || 0,
    lr_amount: editData?.lr_amount || 0,
    driver_cash_received: editData?.driver_cash_received || 0,
  })

  const [extraCharges, setExtraCharges] = useState<ExtraChargeRow[]>(
    Array.isArray(editData?.extra_charges)
      ? editData.extra_charges.map((e: any) => ({
          id: newRowId(),
          label: e?.label ?? '',
          amount: Number(e?.amount) || 0,
          sign: e?.sign === '-' ? '-' : '+',
          include: e?.include !== false,
        }))
      : []
  )

  const addExtraCharge = () =>
    setExtraCharges(prev => [...prev, { id: newRowId(), label: '', amount: 0, sign: '+', include: true }])

  const updateExtraCharge = (id: string, patch: Partial<Omit<ExtraChargeRow, 'id'>>) =>
    setExtraCharges(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)))

  const removeExtraCharge = (id: string) =>
    setExtraCharges(prev => prev.filter(e => e.id !== id))

  // Only rows with a label and a positive amount are saved.
  const validExtraCharges = extraCharges.filter(e => e.label.trim() !== '' && Number(e.amount) > 0)
  // Of those, only the ones marked "include" affect the bill.
  const extrasNet = validExtraCharges
    .filter(e => e.include)
    .reduce((sum, e) => sum + (e.sign === '-' ? -1 : 1) * (Number(e.amount) || 0), 0)

  // Calculate totals
  const rateAmount = amounts.rate * (amounts.payment_weight || 1)
  const totalAmount = rateAmount + amounts.tp_charge_consignor1 + amounts.tp_charge_consignor2 +
                     amounts.rto_charge_gujarat + amounts.rto_charge_maharashtra
  const billAmount = totalAmount + extrasNet - amounts.lr_amount - amounts.driver_cash_received

  const handleAmountChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setAmounts(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  // Prevent decimal / exponent characters for whole-number-only fields.
  const blockDecimalKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
  }

  // Round to a whole number (handles pasted decimals) and update the live total.
  const handleWholeAmountChange = (field: string, el: HTMLInputElement) => {
    if (el.value.includes('.') || el.value.includes(',')) {
      const n = Number(el.value.replace(/,/g, ''))
      el.value = el.value === '' ? '' : String(Number.isFinite(n) ? Math.round(n) : 0)
    }
    handleAmountChange(field, el.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = formRef.current
      if (!form) return
      
      const inputs = Array.from(form.querySelectorAll('input, select, textarea')).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('type') !== 'submit'
      ) as HTMLElement[]
      
      const currentIndex = inputs.indexOf(e.target as HTMLElement)
      const nextIndex = currentIndex + 1
      
      if (nextIndex < inputs.length) {
        inputs[nextIndex].focus()
      }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = tripId && editData
        ? await updateTrip(tripId, formData)
        : await createTrip(formData)
      // On success the action redirects and this line is not reached.
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error(tripId ? 'Trip update failed:' : 'Trip creation failed:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const numberToWords = (num: number): string => {
    if (!isFinite(num) || num === 0) return 'Zero Rupees Only'
    if (num < 0) return 'Minus ' + numberToWords(-num)
    num = Math.round(num)

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    const convertHundreds = (n: number): string => {
      let result = ''
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + ' '
        return result
      }
      if (n > 0) {
        result += ones[n] + ' '
      }
      return result
    }
    
    let result = ''
    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const hundreds = num % 1000
    
    if (crores > 0) result += convertHundreds(crores) + 'Crore '
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh '
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand '
    if (hundreds > 0) result += convertHundreds(hundreds)
    
    return result.trim() + ' Rupees Only'
  }

  const handleAddParty = async (name: string, type: string): Promise<string> => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('type', type)
    
    const newParty = await createParty(formData)
    setPartiesList(prev => [...prev, newParty])
    return newParty.id
  }

  const handleAddTruck = async (truckNo: string): Promise<string> => {
    const formData = new FormData()
    formData.append('truck_no', truckNo)
    formData.append('active', 'true')
    
    const newTruck = await createTruck(formData)
    setTrucksList(prev => [...prev, newTruck])
    return newTruck.id
  }

  const handleDeleteParty = async (id: string): Promise<void> => {
    await deleteParty(id)
    setPartiesList(prev => prev.filter(p => p.id !== id))
    if (selectedParties.consignor_id === id) setSelectedParties(prev => ({ ...prev, consignor_id: '' }))
    if (selectedParties.consignor2_id === id) setSelectedParties(prev => ({ ...prev, consignor2_id: '' }))
    if (selectedParties.consignee1_id === id) setSelectedParties(prev => ({ ...prev, consignee1_id: '' }))
    if (selectedParties.settlement_party_id === id) setSelectedParties(prev => ({ ...prev, settlement_party_id: '' }))
  }

  const handleDeleteTruck = async (id: string): Promise<void> => {
    await deleteTruck(id)
    setTrucksList(prev => prev.filter(t => t.id !== id))
    if (selectedTruck === id) setSelectedTruck('')
  }

  const handlePartySelect = (field: string, value: string) => {
    setSelectedParties(prev => ({ ...prev, [field]: value }))
  }

  const consignors = partiesList.filter(p => p.type === 'consignor' || p.type === 'transport')
  const consignees = partiesList.filter(p => p.type === 'consignee' || p.type === 'transport')
  const owners = partiesList.filter(p => p.type === 'owner')

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
      <input type="hidden" name="status" value="OUT" />
      {/* Basic Trip Information */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_date">Trip Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  name="trip_date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="pr-20"
                />
                {selectedDate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border">
                    {getDayName(selectedDate)}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="truck_id">Truck Number *</Label>
              <SearchableSelect
                options={trucksList.map(truck => ({ id: truck.id, name: truck.truck_no }))}
                value={selectedTruck}
                placeholder="Select or add truck number"
                onSelect={(value) => setSelectedTruck(value)}
                onAddNew={(truckNo) => handleAddTruck(truckNo)}
                onDelete={handleDeleteTruck}
                partyType="truck"
                name="truck_id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="center_city">Center</Label>
              <Input name="center_city" placeholder="Center city" defaultValue={editData?.center_city || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo_details">Cargo</Label>
              <Input name="cargo_details" placeholder="Cargo details" defaultValue={editData?.cargo_details || ''} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_weight">Loading Weight</Label>
              <Input name="loading_weight" type="number" step="0.01" placeholder="0.00" defaultValue={editData?.loading_weight || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_weight">Payment Weight</Label>
              <Input 
                name="payment_weight" 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                defaultValue={editData?.payment_weight || ''}
                onChange={(e) => handleAmountChange('payment_weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr_no">L/R No.</Label>
              <Input name="lr_no" placeholder="LR number" defaultValue={editData?.lr_no || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr_name">L/R Name</Label>
              <Input name="lr_name" placeholder="LR name" defaultValue={editData?.lr_name || ''} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consignor_id">Consignor (1) *</Label>
              <SearchableSelect
                options={consignors}
                value={selectedParties.consignor_id}
                placeholder="Select or add consignor 1"
                onSelect={(value) => handlePartySelect('consignor_id', value)}
                onAddNew={(name) => handleAddParty(name, 'consignor')}
                onDelete={handleDeleteParty}
                partyType="consignor"
                name="consignor_id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consignor2_id">Consignor (2)</Label>
              <SearchableSelect
                options={consignors}
                value={selectedParties.consignor2_id}
                placeholder="Select or add consignor 2"
                onSelect={(value) => handlePartySelect('consignor2_id', value)}
                onAddNew={(name) => handleAddParty(name, 'consignor')}
                onDelete={handleDeleteParty}
                partyType="consignor"
                name="consignor2_id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consignee1_id">Consignee *</Label>
              <SearchableSelect
                options={consignees}
                value={selectedParties.consignee1_id}
                placeholder="Select or add consignee"
                onSelect={(value) => handlePartySelect('consignee1_id', value)}
                onAddNew={(name) => handleAddParty(name, 'consignee')}
                onDelete={handleDeleteParty}
                partyType="consignee"
                name="consignee1_id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settlement_party_id">Truck Owner</Label>
              <SearchableSelect
                options={owners}
                value={selectedParties.settlement_party_id}
                placeholder="Select or add truck owner"
                onSelect={(value) => handlePartySelect('settlement_party_id', value)}
                onAddNew={(name) => handleAddParty(name, 'owner')}
                onDelete={handleDeleteParty}
                partyType="owner"
                name="settlement_party_id"
              />
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party_payment_name">Party Payment Name</Label>
              <Input name="party_payment_name" placeholder="Party payment name" defaultValue={editData?.party_payment_name || ''} />
            </div>
          </div>

          {/* Charges Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Rate *</Label>
              <Input
                name="rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editData?.rate || ''}
                onChange={(e) => handleAmountChange('rate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp_charge_consignor1">TP Charge Consignor 1</Label>
              <Input
                name="tp_charge_consignor1"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editData?.tp_charge_consignor1 || ''}
                onChange={(e) => handleAmountChange('tp_charge_consignor1', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp_charge_consignor2">TP Charge Consignor 2</Label>
              <Input
                name="tp_charge_consignor2"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editData?.tp_charge_consignor2 || ''}
                onChange={(e) => handleAmountChange('tp_charge_consignor2', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rto_charge_gujarat">RTO Charge Gujarat</Label>
              <Input
                name="rto_charge_gujarat"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editData?.rto_charge_gujarat || ''}
                onChange={(e) => handleAmountChange('rto_charge_gujarat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rto_charge_maharashtra">RTO Charge Maharashtra</Label>
              <Input
                name="rto_charge_maharashtra"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editData?.rto_charge_maharashtra || ''}
                onChange={(e) => handleAmountChange('rto_charge_maharashtra', e.target.value)}
              />
            </div>
          </div>

          {/* Total Row */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center font-semibold">
              <div className="text-blue-600">
                <div className="text-xs text-gray-600 mb-1">
                  Rate Amount {amounts.payment_weight > 0 && amounts.rate > 0 ? `(₹${amounts.rate} × ${amounts.payment_weight} MT)` : ''}
                </div>
                <div>{formatCurrency(rateAmount)}</div>
                <div className="text-xs text-gray-500 mt-1">{numberToWords(rateAmount)}</div>
              </div>
              <div className="text-blue-600">
                <div className="text-xs text-gray-600 mb-1">+ TP Charge 1</div>
                <div>{formatCurrency(amounts.tp_charge_consignor1)}</div>
                <div className="text-xs text-gray-500 mt-1">{numberToWords(amounts.tp_charge_consignor1)}</div>
              </div>
              <div className="text-blue-600">
                <div className="text-xs text-gray-600 mb-1">+ TP Charge 2</div>
                <div>{formatCurrency(amounts.tp_charge_consignor2)}</div>
                <div className="text-xs text-gray-500 mt-1">{numberToWords(amounts.tp_charge_consignor2)}</div>
              </div>
              <div className="text-blue-600">
                <div className="text-xs text-gray-600 mb-1">+ RTO Gujarat</div>
                <div>{formatCurrency(amounts.rto_charge_gujarat)}</div>
                <div className="text-xs text-gray-500 mt-1">{numberToWords(amounts.rto_charge_gujarat)}</div>
              </div>
              <div className="text-blue-600">
                <div className="text-xs text-gray-600 mb-1">+ RTO Maharashtra</div>
                <div>{formatCurrency(amounts.rto_charge_maharashtra)}</div>
                <div className="text-xs text-gray-500 mt-1">{numberToWords(amounts.rto_charge_maharashtra)}</div>
              </div>
            </div>
            <div className="text-center mt-4 p-3 bg-white rounded border-2 border-blue-200">
              <div className="text-lg font-bold text-blue-700">
                TOTAL: {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-gray-600 mt-1 font-medium">
                {numberToWords(totalAmount)}
              </div>
            </div>
          </div>

          {/* Extra Charges / Adjustments */}
          <input type="hidden" name="extra_charges" value={JSON.stringify(validExtraCharges.map(({ label, amount, sign, include }) => ({ label: label.trim(), amount, sign, include })))} />
          <div className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label className="text-base">Extra Charges / Adjustments</Label>
                <p className="text-xs text-gray-500">Add or subtract any other amounts (e.g. detention, halting, discount). Untick <span className="font-medium">In bill</span> to keep a row as a note without affecting the bill.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExtraCharge}>
                <Plus className="mr-1 h-4 w-4" />
                Add Row
              </Button>
            </div>

            {extraCharges.length === 0 ? (
              <p className="py-2 text-center text-sm text-gray-400">No extra charges added.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {extraCharges.map((extra) => (
                  <div
                    key={extra.id}
                    className={cn(
                      'flex flex-col gap-2 rounded-lg border p-2.5 transition-colors sm:flex-row sm:items-center',
                      extra.include ? 'border-gray-200 bg-gray-50/70' : 'border-gray-200 bg-gray-100/60'
                    )}
                  >
                    <Input
                      placeholder="Label (e.g. Detention charge)"
                      value={extra.label}
                      onChange={(e) => updateExtraCharge(extra.id, { label: e.target.value })}
                      className="min-w-0 flex-1"
                    />
                    <div className="flex shrink-0 items-center gap-2">
                      {/* Include-in-bill toggle */}
                      <button
                        type="button"
                        onClick={() => updateExtraCharge(extra.id, { include: !extra.include })}
                        aria-pressed={extra.include}
                        title={extra.include ? 'Counted in bill — click to make it a note only' : 'Not in bill — click to add it to the bill'}
                        className={cn(
                          'flex h-10 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors',
                          extra.include
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
                        )}
                      >
                        <span className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-[4px] border',
                          extra.include ? 'border-white bg-white/20' : 'border-gray-300'
                        )}>
                          {extra.include && <Check className="h-3 w-3" />}
                        </span>
                        In bill
                      </button>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={extra.amount || ''}
                          onChange={(e) => updateExtraCharge(extra.id, { amount: parseFloat(e.target.value) || 0 })}
                          className="w-24 pl-7 sm:w-28"
                        />
                      </div>

                      {/* Add (+) / Subtract (-) toggle */}
                      <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateExtraCharge(extra.id, { sign: '+' })}
                          aria-label="Add this amount"
                          aria-pressed={extra.sign === '+'}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center transition-colors',
                            extra.sign === '+' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateExtraCharge(extra.id, { sign: '-' })}
                          aria-label="Subtract this amount"
                          aria-pressed={extra.sign === '-'}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center border-l border-gray-200 transition-colors',
                            extra.sign === '-' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExtraCharge(extra.id)}
                        aria-label="Remove row"
                        className="h-10 w-10 shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {validExtraCharges.some(e => e.include) && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2 text-sm">
                <span className="text-gray-500">Net adjustment:</span>
                <span className={cn('font-semibold', extrasNet < 0 ? 'text-red-600' : 'text-emerald-600')}>
                  {extrasNet < 0 ? '− ' : '+ '}{formatCurrency(Math.abs(extrasNet))}
                </span>
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lr_amount">L/R Amount</Label>
              <Input
                name="lr_amount"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="0"
                defaultValue={editData?.lr_amount || ''}
                onKeyDown={blockDecimalKeys}
                onChange={(e) => handleWholeAmountChange('lr_amount', e.currentTarget)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_cash_received">Driver Cash Received (Kacha na)</Label>
              <Input
                name="driver_cash_received"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="0"
                defaultValue={editData?.driver_cash_received || ''}
                onKeyDown={blockDecimalKeys}
                onChange={(e) => handleWholeAmountChange('driver_cash_received', e.currentTarget)}
              />
            </div>
          </div>

          {/* Bill Amount */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Bill Amount Calculation:</div>
              <div className="text-sm text-gray-700">
                Total Amount: {formatCurrency(totalAmount)}
              </div>
              {validExtraCharges.filter(e => e.include).map((extra) => (
                <div key={extra.id} className="text-sm text-gray-700">
                  {extra.sign === '-' ? 'Less' : 'Add'}: {extra.label.trim()}: {extra.sign === '-' ? '− ' : '+ '}
                  {formatCurrency(Number(extra.amount) || 0)}
                </div>
              ))}
              <div className="text-sm text-gray-700">
                Less: L/R Amount: {formatCurrency(amounts.lr_amount)}
              </div>
              <div className="text-sm text-gray-700">
                Less: Driver Cash: {formatCurrency(amounts.driver_cash_received)}
              </div>
              <hr className="my-2" />
              <div className="text-lg font-bold text-green-700">
                Bill Amount: {formatCurrency(billAmount)}
              </div>
              <div className="text-sm text-gray-600 mt-1 font-medium">
                {numberToWords(billAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
          <CardDescription>Add any additional notes for this trip (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="remarks" className="sr-only">Remarks</Label>
            <Textarea
              id="remarks"
              name="remarks"
              rows={4}
              placeholder="e.g. special handling instructions, delays, agreed terms, anything else worth noting…"
              defaultValue={editData?.remarks || ''}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
          loading={isSubmitting}
        >
          {isSubmitting ? (tripId ? 'Updating Trip...' : 'Creating Trip...') : (tripId ? 'Update Trip' : 'Create Trip')}
        </Button>
      </div>
    </form>
  )
}