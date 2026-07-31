/*
# Update payment method constraint to support card and edahabiya

1. Modified Tables
- `orders` — update payment_method check to include 'card', 'edahabiya', 'cash', 'credit'
- `cash_sales` — update payment_method check to include 'edahabiya' if needed

2. Security
- No security changes
*/

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY['cod','ccp','virement','autre','card','edahabiya','cash','credit','mixed']));

ALTER TABLE cash_sales DROP CONSTRAINT IF EXISTS cash_sales_payment_method_check;
ALTER TABLE cash_sales ADD CONSTRAINT cash_sales_payment_method_check
  CHECK (payment_method = ANY (ARRAY['cash','card','credit','edahabiya','mixed']));
