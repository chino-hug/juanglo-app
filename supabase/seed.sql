-- Velas: local/dev seed data. Team accounts, orders, and appointments below
-- are synthetic placeholders — but the product catalog and the client/
-- prospect directory are the real business data (see PRODUCT.md > Evidence
-- on Hand). Clients only have name/zone/phone confirmed for now; address,
-- email, notes, and status are placeholders to be filled in via the app.
--
-- Demo logins (password for all: "velas1234"), for local Supabase only:
--   admin@velas.test            -> admin
--   vendedora1@velas.test       -> seller
--   vendedora2@velas.test       -> seller
--   preparacion@velas.test      -> picking_packing

-- ---------------------------------------------------------------------------
-- auth users (local dev stack only — includes the full auth schema)
-- profiles rows are created automatically by the on_auth_user_created trigger
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'admin@velas.test', crypt('velas1234', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marisol Admin"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'vendedora1@velas.test', crypt('velas1234', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Camila Rojas"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'vendedora2@velas.test', crypt('velas1234', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luciana Fernandez"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated', 'preparacion@velas.test', crypt('velas1234', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Paredes"}',
   now(), now(), '', '');

-- promote roles beyond the trigger's 'seller' default
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set role = 'picking_packing' where id = '00000000-0000-0000-0000-000000000004';

-- cédulas (synthetic, fictional — see the note at the top of this file)
update public.profiles set cedula = '10111213' where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set cedula = '20212223' where id = '00000000-0000-0000-0000-000000000002';
update public.profiles set cedula = '30313233' where id = '00000000-0000-0000-0000-000000000003';
update public.profiles set cedula = '40414243' where id = '00000000-0000-0000-0000-000000000004';

-- ---------------------------------------------------------------------------
-- zones
-- ---------------------------------------------------------------------------
-- city/region: best-effort classification of real Medellín/Valle de Aburrá
-- geography (Pasto is a different city entirely). Several of these (San
-- Juan, San Pío, Campo Valdez, Barrio Antioquia, Belencito, Robledo, San
-- Lucas, Pedregal, Belén, Guayabal) are judgment calls, not certainties —
-- editable per-zone from /admin/clientes/zonas.
insert into public.zones (id, name, description, areas, city, region, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Zona Centro', null, '[]', 'Valle de Aburrá', 'Centro', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Zona Poblado', null, '[]', 'Valle de Aburrá', 'Oriente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', 'Zona La America', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000004', 'Zona Caldas', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000005', 'Zona Belen', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000006', 'Zona Envigado', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000007', 'Zona Envigado Plaza', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000008', 'Zona Estrella', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000009', 'Zona San Juan', null, '[]', 'Valle de Aburrá', 'Centro', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000010', 'Zona Itagui', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000011', 'Zona Guayabal', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000012', 'Zona San Pio', null, '[]', 'Valle de Aburrá', 'Oriente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000013', 'Zona Copacabana', null, '[]', 'Valle de Aburrá', 'Norte', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000014', 'Zona Sabaneta', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000015', 'Zona Campo Valdez', null, '[]', 'Valle de Aburrá', 'Oriente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000016', 'Zona Barrio Antioquia', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000017', 'Zona Belencito', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000018', 'Zona Palmas', null, '[]', 'Valle de Aburrá', 'Oriente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000019', 'Zona Prado', null, '[]', 'Valle de Aburrá', 'Centro', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000020', 'Zona Pasto', null, '[]', 'Pasto', null, '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000021', 'Zona Robledo', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000022', 'Zona San Lucas', null, '[]', 'Valle de Aburrá', 'Oriente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000023', 'Zona Bello', null, '[]', 'Valle de Aburrá', 'Norte', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000024', 'Zona Termianl Sur', null, '[]', 'Valle de Aburrá', 'Sur', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000025', 'Zona Pedregal', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000026', 'Zona San Cristobal', null, '[]', 'Valle de Aburrá', 'Occidente', '00000000-0000-0000-0000-000000000002');

-- ---------------------------------------------------------------------------
-- products — real catalog (papel celofán, velas, pebeteros), matched from
-- the supplier's own reference sheet + July 2026 inventory count. Colors
-- are tracked per reference/SKU, not per unit — one stock count covers every
-- color listed for that reference, same as the physical inventory sheet.
-- ---------------------------------------------------------------------------
insert into public.products (id, sku, name, description, category, colors, price, quantity_on_hand, low_stock_threshold) values
  ('20000000-0000-0000-0000-000000000001', 'CEL-REF01', 'Papel Celofán Ref. 1', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado"]', 1030, 17817, 1500),
  ('20000000-0000-0000-0000-000000000002', 'CEL-REF02', 'Papel Celofán Ref. 2', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores"]', 1930, 12928, 1500),
  ('20000000-0000-0000-0000-000000000003', 'CEL-REF03', 'Papel Celofán Ref. 3', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul"]', 2650, 7884, 1500),
  ('20000000-0000-0000-0000-000000000004', 'CEL-REF04', 'Papel Celofán Ref. 4', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado"]', 3060, 5081, 1000),
  ('20000000-0000-0000-0000-000000000005', 'CEL-REF05', 'Papel Celofán Ref. 5', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul"]', 3650, 6240, 1000),
  ('20000000-0000-0000-0000-000000000006', 'CEL-REF06', 'Papel Celofán Ref. 6', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul","Blanco/Verde/Dorado"]', 4810, 6812, 1000),
  ('20000000-0000-0000-0000-000000000007', 'CEL-REF07', 'Papel Celofán Ref. 7', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul","Blanco/Verde/Dorado"]', 6180, 5889, 1000),
  ('20000000-0000-0000-0000-000000000008', 'CEL-REF08', 'Papel Celofán Ref. 8', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul","Blanco/Verde/Dorado","Naranja/Rojo/Dorado","Amarillo/Naranja/Dorado"]', 8460, 2866, 600),
  ('20000000-0000-0000-0000-000000000009', 'CEL-REF09', 'Papel Celofán Ref. 9', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul","Blanco/Verde/Dorado","Naranja/Rojo/Dorado","Amarillo/Naranja/Dorado"]', 11570, 2801, 600),
  ('20000000-0000-0000-0000-000000000010', 'CEL-REF10', 'Papel Celofán Ref. 10', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado"]', 9010, 883, 200),
  ('20000000-0000-0000-0000-000000000011', 'CEL-REF11', 'Papel Celofán Ref. 11', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado"]', 15320, 950, 200),
  ('20000000-0000-0000-0000-000000000012', 'CEL-REF12', 'Papel Celofán Ref. 12', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores"]', 18550, 613, 150),
  ('20000000-0000-0000-0000-000000000013', 'CEL-REF13', 'Papel Celofán Ref. 13', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado"]', 23320, 701, 150),
  ('20000000-0000-0000-0000-000000000014', 'CEL-REF14', 'Papel Celofán Ref. 14', null, 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores"]', 28410, 726, 150),
  ('20000000-0000-0000-0000-000000000015', 'CEL-9840', 'Papel Celofán 9.8×40', null, 'Papel celofán', '["Blanco"]', 34980, 16, 5),
  ('20000000-0000-0000-0000-000000000016', 'CEL-9850', 'Papel Celofán 9.8×50', null, 'Papel celofán', '["Blanco"]', 44520, 9, 3),
  ('20000000-0000-0000-0000-000000000017', 'CEL-EST11', 'Papel Celofán Estuches Ref. 11', null, 'Papel celofán', '[]', 0, 1000, 200),
  ('20000000-0000-0000-0000-000000000018', 'CEL-EST13', 'Papel Celofán Estuches Ref. 13', null, 'Papel celofán', '[]', 0, 1000, 200),
  ('20000000-0000-0000-0000-000000000019', 'VEL-NAV', 'Vela Navideña', null, 'Velas', '["Surtida 5 colores"]', 2700, 3360, 500),
  ('20000000-0000-0000-0000-000000000020', 'VEL-14CM', 'Paquete Vela 14cm (10 unid)', null, 'Velas', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Beige","Surtida 5 colores"]', 2890, 2400, 500),
  ('20000000-0000-0000-0000-000000000021', 'VEL-18CM', 'Paquete Vela 18cm (10 unid)', null, 'Velas', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Beige","Surtida 5 colores"]', 3720, 3400, 500),
  ('20000000-0000-0000-0000-000000000022', 'VEL-2X19', 'Paquete Vela 2×19 (10 unid)', null, 'Velas', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Beige","Surtida 5 colores"]', 6470, 2440, 500),
  ('20000000-0000-0000-0000-000000000023', 'VEL-2X30', 'Paquete Vela 2×30 (4 unid)', null, 'Velas', '["Blanco","Negro","Dorado","Plateado","Beige"]', 4810, 150, 30),
  ('20000000-0000-0000-0000-000000000024', 'PEB-BLA', 'Pebeteros Blancos', null, 'Pebeteros', '["Blanco"]', 46000, 3, 5);

-- ---------------------------------------------------------------------------
-- product categories — each one's colors is the union of every color used
-- by a product already seeded in that category above.
-- ---------------------------------------------------------------------------
insert into public.product_categories (id, name, colors) values
  ('21000000-0000-0000-0000-000000000001', 'Papel celofán', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Siete colores","Amarillo/Rojo","Amarillo/Verde","Blanco/Rojo","Blanco/Rosado","Blanco/Morado","Rojo/Negro","Azul/Negro","Blanco/Azul","Blanco/Verde/Dorado","Naranja/Rojo/Dorado","Amarillo/Naranja/Dorado"]'),
  ('21000000-0000-0000-0000-000000000002', 'Velas', '["Blanco","Amarillo","Verde","Azul","Rojo","Rosado","Morado","Naranja","Negro","Dorado","Plateado","Beige","Surtida 5 colores"]'),
  ('21000000-0000-0000-0000-000000000003', 'Pebeteros', '["Blanco"]');

-- ---------------------------------------------------------------------------
-- global color registry — every category's palette above is a subset of
-- this list (union of every color used across all three categories).
-- ---------------------------------------------------------------------------
insert into public.product_colors (name) values
  ('Blanco'), ('Amarillo'), ('Verde'), ('Azul'), ('Rojo'), ('Rosado'), ('Morado'), ('Naranja'),
  ('Negro'), ('Dorado'), ('Plateado'), ('Siete colores'), ('Amarillo/Rojo'), ('Amarillo/Verde'),
  ('Blanco/Rojo'), ('Blanco/Rosado'), ('Blanco/Morado'), ('Rojo/Negro'), ('Azul/Negro'),
  ('Blanco/Azul'), ('Blanco/Verde/Dorado'), ('Naranja/Rojo/Dorado'), ('Amarillo/Naranja/Dorado'),
  ('Beige'), ('Surtida 5 colores');

-- ---------------------------------------------------------------------------
-- real client directory (name/zone/phone confirmed; address, email, notes
-- default to blank/null and business_name/status are placeholders — fill in
-- via the app as that information comes in). All assigned to vendedora1 for
-- now; reassign per-client from admin > Clientes as ownership is confirmed.
-- ---------------------------------------------------------------------------
insert into public.clients (id, seller_id, zone_id, name, business_name, phone, email, address, lat, lng, notes, status) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '7 POTENCIAS', null, '3214352597', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '7 POTENCIAS 2', null, '3214352597', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'A&C', null, '3127447049', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'ADELA', null, '3212359895', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'AGENCIA CORDOBA', null, '3136957012', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'ALCACHOFA', null, '3104698155', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'ALIADO SUTIMAX', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'ALIRIO EVG', null, '3168539497', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'ALL NATURAL', null, '3125271060', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'AMASTITA 911', null, '3053896234', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'ANGELA MARIA LOS ALPES', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'ANTILLAS', null, '3053026272', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'AROMAS DEL CAMPO', null, '3155048929', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 'ARTE MODERNO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'AY QUE RICO', null, '3128597698', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'BALLENA', null, '3195983754', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'BENDICION', null, '3125271060', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 'BETTEL', null, '3234713068', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'BOTON DE ORO', null, '3104035738', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'CACHARRERIA BELEN RINCON', null, '3122265838', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'CAFETAL', null, '3194509665', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'CARLOS GAVIRIA', null, '3016088944', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'CARMELO', null, '3192397485', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'CARVEL', null, '3052361647', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'CASA BLANCA', null, '3218731657', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'CASA RAMAL', null, '3127447049', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'CASA VELON', null, '3135466551', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CENTRO 3', null, '3005949499', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'CESAR PLANTAS', null, '3155292530', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CHASOY', null, '3114322621', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'CHINGUI', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CID', null, '3212571468', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'COLTEJER', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'COLTEJER 2', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000013', 'COPACABANA', null, '3217356549', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000036', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'CRISTINA LA GRUTA', null, '3206123956', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000037', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'DAVID WEDDING', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000038', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'DETODITO 2', null, '3147958214', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000039', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'DIEGO CUÑADO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'DIEGO DHARMA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'DISTRI ITAGUI', null, '3017734547', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'DOLLAR', null, '3147701907', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'DRAGON 1', null, '3107897434', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'DRAGON 2', null, '3127243618', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000015', 'EDITH YULIETH', null, '3144184931', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000046', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'EL CIELO BASICO', null, '3007798400', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000047', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'EL EDEN', null, '3148190057', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000048', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'ELKIN CENTRO', null, '3218275249', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000049', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000016', 'ESQUINA REDONDA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'FAMIMAX', null, '3005457317', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'FELIPE RIEGOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'FINCA SAN MIGUEL', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'FLACO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'FLOR CANELA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'FRUVER CALATRAVA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'FUENTE AZUL', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'GAIA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'GALILEA', null, '3113277312', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000059', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'GIORGIO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'GLORIA ENVIGADO', null, '3505893288', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'HERIBERTO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000017', 'HERMANA CLARA EDILMA', null, '3234504796', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 'HOJAS BLANCAS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'HOLISTICO Y ESOTERICO VILMONS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'HOTELES 23', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000066', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'HUECO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000067', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'HUGO SABANETA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000068', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000018', 'INV VALIRA', null, '3173410487', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000069', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'ISOLDA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'IVAN MAZO MEJIA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'J.O', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'JORGE MONTOYA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000073', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'JORGE PARAFIN', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000074', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'JULIAN TOPACIO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000075', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000020', 'KANJI SUR', null, '3186044601', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000076', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'KOSMOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000077', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'LA CAMPIÑITA', null, '3148860398', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000078', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'LA CRUZ', null, '3206876258', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000079', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'LA FINKITA RAMIRO', null, '3148154844', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'LA HUERTA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000081', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'LEGUMBRE MONO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000082', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'LEGUMBRES', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000083', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'LIBRERÍA SEMONARIO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000084', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'LIGIA ELENA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000085', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000021', 'LILIANA TRUJILLO', null, '3016575681', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000086', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'LOS CUÑADOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000087', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'LOS NIÑOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000088', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000022', 'MANUELA UNITY', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000089', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'MARGARITA ESOTERICA BELEN', null, '3219178723', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000090', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'MARIA ALEJANDRA BR', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000091', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'MARIA CAMILA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000092', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'MARIA EUGENIA PARAISO', null, '3135114464', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000093', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MARIA JULIANA BOTERO', null, '3045888740', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000094', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MARIA ORIENTAL', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000095', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MARIA PALO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000096', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MARIANITO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000097', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'MARIELA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MARINITA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000002', null, 'MARIO CARDONA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MARIO SABANETA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MARTHA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000023', 'MARTHA BELLO', null, '3105324905', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MAURO LA CEJA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'ME RINDE', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MEDINATURAL', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'MEJORANA', null, '3127965394', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'MONKEY', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MOROCHO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'NAILAH', null, '3137505598', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'NATUAROMA', null, '3233944210', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'NATURAL SEX', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'NATURISTA PAOLA', null, '3147576260', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'NATURISTA PLATINO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'NICHES', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'NIÑOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'NOHELIA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000117', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'NUEVO HORIZONTE', null, '3116468816', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000118', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'NUEVO UNIVERSO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000119', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'ODEON', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'PABILO HOME', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'PADRE PIO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000122', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000024', 'PADRE SANTIAGO BEDOYA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000123', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 'PANADERIA CAMPO AMOR', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000124', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'PANKA NIKKEI', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000125', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000024', 'PARROQUIA INMACULADA CONCEPCION', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000126', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'PARROQUIA JESUS EUCARISTIA MEDELLIN', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000127', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'PARROQUIA NIÑO JESUS DE CALATRAVA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000128', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000025', 'PEDREGAL', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000129', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'PETHET', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'PIETRA SANTA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'PLACITA', null, '3023077405', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'PRECIOS LOCOS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'RAPISAVI', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000134', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'REFLEJO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000135', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'ROCIO NOTARIA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000136', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'RUISEÑOR', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000137', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'SAN JUDAS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000138', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'SANTO CURA DE ARS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000139', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'SEBASTIAN 7 POTENCIAS', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000140', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'SHADAY', null, '3127015359', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000141', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'SHADDAY 2', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000142', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'SHADDAY CENTRO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000143', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'SHIBARI', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000144', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'SOPLO DE FE LINA BETANCUR', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000145', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000026', 'STEFANIA INSTAGRAM', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000146', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'STEVEN', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000147', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'TALLER DE LAS FLORES', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000148', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'TIA ROSA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000149', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'TROPICO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000150', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'VATICANO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000151', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'VIVIENDAS DEL SUR', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000152', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000018', 'VOLVER SIEMPRE VOLVER', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000153', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'WILTON', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000154', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'X FLACA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000155', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000023', 'CHAMAN', null, '3105281717', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000156', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'BARATON', null, '3127447049', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000157', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'CAÑA', null, '3104473569', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000158', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'LA REVUELTA', null, '3245939178', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000159', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'MERCAREMOS', null, '3007333501', null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000160', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', 'LA SABANA', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000161', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'BUEN SERVICIO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000162', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'YOYITO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000163', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'CIRCULO ESOTERICO', null, null, null, null, null, null, null, 'client'),
  ('30000000-0000-0000-0000-000000000164', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000019', 'SANDALO VAINILLA', null, null, null, null, null, null, null, 'client');

-- ---------------------------------------------------------------------------
-- appointments (today + this week, for vendedora1)
-- ---------------------------------------------------------------------------
insert into public.appointments (client_id, seller_id, scheduled_at, status, notes) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', now()::date + interval '10 hours', 'scheduled', 'Reposición mensual'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', now()::date + interval '12 hours 30 minutes', 'scheduled', 'Primera visita, mostrar catálogo regalo'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', now()::date + interval '15 hours', 'scheduled', 'Visita de prospección agendada'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', now()::date - interval '2 days' + interval '11 hours', 'done', 'Compró 3 unidades');

-- ---------------------------------------------------------------------------
-- orders across the full status pipeline
-- ---------------------------------------------------------------------------

-- order 1: fully delivered
insert into public.orders (id, client_id, seller_id, status, total) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'created', 2060);
insert into public.order_items (order_id, product_id, quantity, unit_price) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2, 1030);
update public.orders set status = 'picking' where id = '40000000-0000-0000-0000-000000000001';
update public.orders set status = 'packed' where id = '40000000-0000-0000-0000-000000000001';
update public.orders set status = 'out_for_delivery' where id = '40000000-0000-0000-0000-000000000001';
update public.orders set status = 'delivered' where id = '40000000-0000-0000-0000-000000000001';

-- order 2: newly created, waiting on picking/packing
insert into public.orders (id, client_id, seller_id, status, total) values
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'created', 5780);
insert into public.order_items (order_id, product_id, quantity, unit_price) values
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000020', 2, 2890);

-- order 3: mid-pipeline, being packed
insert into public.orders (id, client_id, seller_id, status, total) values
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'created', 46000);
insert into public.order_items (order_id, product_id, quantity, unit_price) values
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000024', 1, 46000);
update public.orders set status = 'picking' where id = '40000000-0000-0000-0000-000000000003';
update public.orders set status = 'packed' where id = '40000000-0000-0000-0000-000000000003';

-- order 4: cancelled before fulfillment
insert into public.orders (id, client_id, seller_id, status, total) values
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'created', 1030);
insert into public.order_items (order_id, product_id, quantity, unit_price) values
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 1, 1030);
update public.orders set status = 'cancelled' where id = '40000000-0000-0000-0000-000000000004';
