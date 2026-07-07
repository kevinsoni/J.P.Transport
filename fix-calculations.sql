-- Fix trip calculation trigger for J.P. Transport
-- Rate is treated as a PER-MT rate (Rate × Payment Weight), and the stored
-- total_amount is the NET bill (charges − L/R Amount − Driver Cash Received)
-- so that: Bill Amount − Received = Balance Due.

CREATE OR REPLACE FUNCTION update_trip_calculations()
RETURNS TRIGGER AS $$
DECLARE
  weight_multiplier NUMERIC;
  rate_amount NUMERIC;
  total_charges NUMERIC;
  bill_amount NUMERIC;
  total_payments NUMERIC;
  new_payment_status pay_status;
BEGIN
  -- Rate is per-MT; multiply by payment weight (fallback to 1 when weight is 0/null)
  weight_multiplier := CASE WHEN COALESCE(NEW.payment_weight, 0) > 0 THEN NEW.payment_weight ELSE 1 END;
  rate_amount := COALESCE(NEW.rate, 0) * weight_multiplier;

  -- Gross charges
  total_charges := rate_amount
                 + COALESCE(NEW.tp_charge_consignor1, 0)
                 + COALESCE(NEW.tp_charge_consignor2, 0)
                 + COALESCE(NEW.rto_charge_gujarat, 0)
                 + COALESCE(NEW.rto_charge_maharashtra, 0);

  -- Net bill = charges minus L/R amount and driver cash received
  bill_amount := total_charges
               - COALESCE(NEW.lr_amount, 0)
               - COALESCE(NEW.driver_cash_received, 0);

  -- Sum of recorded payments for this trip
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM payments
  WHERE trip_id = NEW.id;

  -- Payment status is derived against the net bill
  IF total_payments = 0 THEN
    new_payment_status := 'UNPAID';
  ELSIF total_payments >= bill_amount THEN
    new_payment_status := 'PAID';
  ELSE
    new_payment_status := 'PARTIAL';
  END IF;

  NEW.total_amount := bill_amount;             -- headline "Bill Amount" (net)
  NEW.amount_received := total_payments;
  NEW.balance_due := bill_amount - total_payments;
  NEW.payment_status := new_payment_status;
  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger is attached
DROP TRIGGER IF EXISTS trigger_update_trip_calculations ON trips;
CREATE TRIGGER trigger_update_trip_calculations
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_calculations();

-- Recompute all existing trips with the corrected logic
UPDATE trips SET updated_at = now();
