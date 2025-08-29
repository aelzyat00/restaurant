-- إنشاء دالة لتوليد رقم طلب فريد

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  order_num TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    -- توليد رقم طلب بصيغة ORD-YYYYMMDD-XXXX
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- التحقق من عدم وجود الرقم مسبقاً
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
      RETURN order_num;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$;

-- إنشاء trigger لتوليد رقم الطلب تلقائياً
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();
