-- Enable RLS on remaining tables that need it
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cover_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_print_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tier_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_detail_cover_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for order-related tables
CREATE POLICY "Authenticated users can manage orders"
ON public.orders FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order tags"
ON public.order_tags FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order cover colors"
ON public.order_cover_colors FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order packing items"
ON public.order_packing_items FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order revision history"
ON public.order_revision_history FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order attachments"
ON public.order_attachments FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order print history"
ON public.order_print_history FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order logs"
ON public.order_logs FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order ingredients"
ON public.order_ingredients FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order tier details"
ON public.order_tier_details FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage tier detail cover colors"
ON public.tier_detail_cover_colors FOR ALL
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage order delivery assignments"
ON public.order_delivery_assignments FOR ALL
USING (auth.role() = 'authenticated'::text);