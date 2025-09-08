-- Supabase SQL Schema for J.P. Transport Management System
-- Run this in your Supabase SQL Editor

-- Create enums
CREATE TYPE party_type AS ENUM ('consignor', 'consignee', 'owner', 'transport');
CREATE TYPE trip_status AS ENUM ('IN', 'OUT', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'BANK', 'OTHER');
CREATE TYPE pay_status AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- Create parties table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type party_type NOT NULL,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trucks table
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_no TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES parties(id),
  capacity_tons NUMERIC,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trips table with extended fields
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_date DATE NOT NULL,
  status trip_status NOT NULL DEFAULT 'OUT',
  truck_id UUID NOT NULL REFERENCES trucks(id),
  center_city TEXT,
  origin_city TEXT,
  destination_city TEXT,
  cargo_details TEXT,
  transport_details TEXT,
  consignor_id UUID NOT NULL REFERENCES parties(id),
  consignee1_id UUID NOT NULL REFERENCES parties(id),
  consignee2_id UUID REFERENCES parties(id),
  lr_no TEXT,
  invoice_no TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  weight_mt NUMERIC,
  no_of_packages INTEGER,
  route_notes TEXT,
  remarks TEXT,

  -- Amount fields
  freight_amount NUMERIC NOT NULL DEFAULT 0,
  rto_charges NUMERIC NOT NULL DEFAULT 0,
  toll_charges NUMERIC NOT NULL DEFAULT 0,
  loading_unloading NUMERIC NOT NULL DEFAULT 0,
  diesel_advance NUMERIC NOT NULL DEFAULT 0,
  other_charges NUMERIC NOT NULL DEFAULT 0,
  tax_percent NUMERIC NOT NULL DEFAULT 0,

  -- Calculated fields
  total_amount NUMERIC NOT NULL DEFAULT 0,
  amount_received NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  payment_status pay_status NOT NULL DEFAULT 'UNPAID',

  -- Extended fields
  material_type TEXT,
  e_way_bill_no TEXT,
  payment_terms TEXT,
  due_date DATE,
  km_distance INTEGER,
  settlement_party_id UUID REFERENCES parties(id),
  rto_details TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  method payment_method NOT NULL,
  reference_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create attachments table (optional)
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_trucks_truck_no ON trucks(truck_no);
CREATE INDEX idx_trips_date ON trips(trip_date);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_payment_status ON trips(payment_status);
CREATE INDEX idx_trips_consignor ON trips(consignor_id);
CREATE INDEX idx_trips_consignee1 ON trips(consignee1_id);
CREATE INDEX idx_trips_consignee2 ON trips(consignee2_id);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_payments_trip ON payments(trip_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Function to update trip calculations
CREATE OR REPLACE FUNCTION update_trip_calculations()
RETURNS TRIGGER AS $$
DECLARE
  subtotal NUMERIC;
  tax_amount NUMERIC;
  new_total NUMERIC;
  total_payments NUMERIC;
  new_balance NUMERIC;
  new_payment_status pay_status;
BEGIN
  -- Calculate subtotal
  subtotal := NEW.freight_amount + NEW.rto_charges + NEW.toll_charges + 
              NEW.loading_unloading + NEW.other_charges - NEW.diesel_advance;
  
  -- Calculate tax
  tax_amount := (subtotal * NEW.tax_percent / 100);
  
  -- Calculate total
  new_total := subtotal + tax_amount;
  
  -- Get total payments for this trip
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM payments 
  WHERE trip_id = NEW.id;
  
  -- Calculate balance
  new_balance := new_total - total_payments;
  
  -- Determine payment status
  IF total_payments = 0 THEN
    new_payment_status := 'UNPAID';
  ELSIF total_payments >= new_total THEN
    new_payment_status := 'PAID';
  ELSE
    new_payment_status := 'PARTIAL';
  END IF;
  
  -- Update calculated fields
  NEW.total_amount := new_total;
  NEW.amount_received := total_payments;
  NEW.balance_due := new_balance;
  NEW.payment_status := new_payment_status;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trip calculations
CREATE TRIGGER trigger_update_trip_calculations
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_calculations();

-- Function to recalculate trip when payments change
CREATE OR REPLACE FUNCTION recalculate_trip_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  trip_record trips%ROWTYPE;
BEGIN
  -- Get the trip record
  SELECT * INTO trip_record FROM trips WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  -- Update the trip to trigger recalculation
  UPDATE trips SET updated_at = now() WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for payment changes
CREATE TRIGGER trigger_payment_insert
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_trip_on_payment();

CREATE TRIGGER trigger_payment_update
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_trip_on_payment();

CREATE TRIGGER trigger_payment_delete
  AFTER DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_trip_on_payment();

-- Enable Row Level Security (RLS)
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simple auth-based, modify for multi-tenant if needed)
CREATE POLICY "Authenticated users can manage parties" ON parties
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage trucks" ON trucks
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage trips" ON trips
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage payments" ON payments
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage attachments" ON attachments
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO parties (name, type, phone, email, gstin, address, city) VALUES
  ('ABC Suppliers', 'consignor', '9876543210', 'abc@example.com', '27AABCU9603R1Z2', '123 Business Park', 'Mumbai'),
  ('XYZ Industries', 'consignee', '9876543211', 'xyz@example.com', '07AABCU9603R1Z3', '456 Industrial Area', 'Delhi'),
  ('PQR Textiles', 'consignee', '9876543214', 'pqr@example.com', '29AABCU9603R1Z5', '789 Textile Hub', 'Bangalore'),
  ('Transport Owner', 'owner', '9876543212', 'owner@example.com', '27AABCU9603R1Z4', '789 Owner Street', 'Mumbai');

INSERT INTO trucks (truck_no, owner_id, capacity_tons, active) VALUES
  ('MH12AB1234', (SELECT id FROM parties WHERE name = 'Transport Owner'), 20, true),
  ('KA05CD5678', (SELECT id FROM parties WHERE name = 'Transport Owner'), 25, true);

INSERT INTO trips (
  trip_date, status, truck_id, center_city, origin_city, destination_city,
  cargo_details, consignor_id, consignee1_id, lr_no, invoice_no,
  driver_name, driver_phone, weight_mt, no_of_packages,
  freight_amount, rto_charges, toll_charges, loading_unloading,
  diesel_advance, other_charges, tax_percent, material_type, e_way_bill_no
) VALUES
  (
    '2024-01-15', 'COMPLETED',
    (SELECT id FROM trucks WHERE truck_no = 'MH12AB1234'),
    'Mumbai', 'Mumbai', 'Delhi', 'Electronics',
    (SELECT id FROM parties WHERE name = 'ABC Suppliers'),
    (SELECT id FROM parties WHERE name = 'XYZ Industries'),
    'LR001', 'INV001', 'Ravi Kumar', '9876543210', 15.5, 100,
    50000, 2000, 1500, 1000, 5000, 500, 18, 'Electronics', 'EWB001'
  ),
  (
    '2024-01-20', 'OUT',
    (SELECT id FROM trucks WHERE truck_no = 'KA05CD5678'),
    'Delhi', 'Delhi', 'Bangalore', 'Textiles',
    (SELECT id FROM parties WHERE name = 'ABC Suppliers'),
    (SELECT id FROM parties WHERE name = 'PQR Textiles'),
    'LR002', 'INV002', 'Suresh Singh', '9876543213', 18.0, 200,
    65000, 1500, 2000, 1500, 8000, 1000, 18, 'Textiles', 'EWB002'
  );

-- Insert sample payments
INSERT INTO payments (trip_id, payment_date, amount, method, reference_no, notes) VALUES
  (
    (SELECT id FROM trips WHERE lr_no = 'LR001'),
    '2024-01-20', 58950, 'UPI', 'UPI123456', 'Full payment'
  ),
  (
    (SELECT id FROM trips WHERE lr_no = 'LR002'),
    '2024-01-22', 30000, 'CASH', NULL, 'Advance payment'
  );