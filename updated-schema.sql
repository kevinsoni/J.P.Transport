-- Updated Supabase SQL Schema for J.P. Transport Management System
-- Run this in your Supabase SQL Editor to add new fields

-- Add new fields to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loading_weight NUMERIC;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS payment_weight NUMERIC;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS lr_name TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS consignor2_id UUID REFERENCES parties(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rate NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tp_charge_consignor1 NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tp_charge_consignor2 NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rto_charge_gujarat NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rto_charge_maharashtra NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS lr_amount NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_cash_received NUMERIC DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS party_payment_name TEXT;

-- Update the calculation function to include new fields
CREATE OR REPLACE FUNCTION update_trip_calculations()
RETURNS TRIGGER AS $$
DECLARE
  total_charges NUMERIC;
  bill_amount NUMERIC;
  total_payments NUMERIC;
  new_balance NUMERIC;
  new_payment_status pay_status;
BEGIN
  -- Calculate total charges (Rate + TP Charges + RTO Charges)
  total_charges := COALESCE(NEW.rate, 0) + 
                   COALESCE(NEW.tp_charge_consignor1, 0) + 
                   COALESCE(NEW.tp_charge_consignor2, 0) + 
                   COALESCE(NEW.rto_charge_gujarat, 0) + 
                   COALESCE(NEW.rto_charge_maharashtra, 0);
  
  -- Calculate bill amount (Total - LR Amount - Driver Cash)
  bill_amount := total_charges - 
                 COALESCE(NEW.lr_amount, 0) - 
                 COALESCE(NEW.driver_cash_received, 0);
  
  -- Get total payments for this trip
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM payments 
  WHERE trip_id = NEW.id;
  
  -- Calculate balance
  new_balance := bill_amount - total_payments;
  
  -- Determine payment status
  IF total_payments = 0 THEN
    new_payment_status := 'UNPAID';
  ELSIF total_payments >= bill_amount THEN
    new_payment_status := 'PAID';
  ELSE
    new_payment_status := 'PARTIAL';
  END IF;
  
  -- Update calculated fields
  NEW.total_amount := total_charges;
  NEW.amount_received := total_payments;
  NEW.balance_due := new_balance;
  NEW.payment_status := new_payment_status;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_trips_consignor2 ON trips(consignor2_id);
CREATE INDEX IF NOT EXISTS idx_trips_loading_weight ON trips(loading_weight);
CREATE INDEX IF NOT EXISTS idx_trips_payment_weight ON trips(payment_weight);