-- ====================================================================
-- Migration: 002_seed_categories.sql
-- Description: Standard initial business and listing categories
-- ====================================================================

INSERT INTO categories (name, slug, description, icon_name, display_order)
VALUES
    ('Restaurants & Cafes', 'restaurants', 'Fine dining, cafes, caterers, and food outlets', 'Utensils', 1),
    ('IT & Software Services', 'it-services', 'Web development, mobile apps, cloud hosting, and IT support', 'Code2', 2),
    ('Electronics & Appliances', 'electronics', 'Consumer electronics, repair, mobile phones, and computers', 'Tv', 3),
    ('Healthcare & Clinics', 'healthcare', 'Hospitals, specialty clinics, diagnostics, and pharmacies', 'Stethoscope', 4),
    ('Construction & Real Estate', 'construction', 'Builders, civil contractors, building materials, and real estate', 'Building', 5),
    ('Interior Designers', 'interior-design', 'Commercial and residential interior design and architecture', 'Palette', 6),
    ('Automobile & Garages', 'automobile', 'Car and bike sales, servicing, spare parts, and detailing', 'Car', 7),
    ('Home Services', 'home-services', 'Plumbing, electrician, cleaning, pest control, and AC service', 'Wrench', 8),
    ('Manufacturing & Industrial', 'manufacturing', 'Machinery, raw materials, industrial fabrication, and supplies', 'Factory', 9),
    ('Education & Coaching', 'education', 'Schools, competitive exam coaching, language tutors, and skill training', 'GraduationCap', 10),
    ('Beauty & Wellness', 'beauty-wellness', 'Salons, spas, dermatologists, fitness gyms, and yoga centers', 'Sparkles', 11),
    ('Financial & Legal', 'financial-legal', 'Chartered accountants, tax advisors, advocates, and insurance consultants', 'Scale', 12)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();
