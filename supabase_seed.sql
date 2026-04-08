-- Seed data for Nexus OS

-- 1. Users
INSERT INTO public.users (id, firebase_uid, email, full_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'uid-admin', 'admin@nexus.com', 'Admin User', 'admin'),
('00000000-0000-0000-0000-000000000002', 'uid-user', 'user@nexus.com', 'Standard User', 'user'),
('00000000-0000-0000-0000-000000000003', 'uid-viewer', 'viewer@nexus.com', 'Viewer User', 'viewer')
ON CONFLICT (id) DO NOTHING;

-- 2. Jobs
INSERT INTO public.jobs (id, user_id, title, description, type, status, receipt_no, date) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Üretim Emri 001', 'Demo üretim işi', 'production', 'pending', 'RE-001', NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Üretim Emri 002', 'Demo üretim işi', 'production', 'in_progress', 'RE-002', NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Üretim Emri 003', 'Demo üretim işi', 'production', 'completed', 'RE-003', NOW());

-- 3. Stocks
INSERT INTO public.stocks (id, user_id, sku, name, quantity, unit, cost_price, sale_price) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU001', 'Alüminyum Profil 20x20', 100, 'metre', 45.50, 75.00),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU002', 'Çelik Vida M6x30', 5000, 'adet', 0.15, 0.45),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU003', 'Rulman 608ZZ', 200, 'adet', 12.00, 25.00),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU004', 'Plastik Enjeksiyon Kalıbı', 5, 'adet', 1500.00, 2500.00),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU005', 'Endüstriyel Yağ 10W-40', 50, 'litre', 85.00, 140.00),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'SKU006', 'Bakır Kablo 2.5mm', 500, 'metre', 18.00, 32.00);

-- 4. Accounts
INSERT INTO public.accounts (id, user_id, company_name, contact_name, account_type, email, phone) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Global Lojistik A.Ş.', 'Ahmet Yılmaz', 'supplier', 'info@globallojistik.com', '0212 555 1010'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tekno Market Ltd. Şti.', 'Mehmet Demir', 'customer', 'satis@teknomarket.com', '0216 444 2020'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Yıldız Hammadde Tedarik', 'Ayşe Yıldız', 'supplier', 'ayse@yildizhammaddde.com', '0232 333 4040'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Özdemir İnşaat Grubu', 'Can Özdemir', 'customer', 'can@ozdemirinsaat.com', '0312 222 5050'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Anadolu Makine Sanayi', 'Murat Kaya', 'both', 'murat@anadolumakine.com', '0224 111 6060');

-- 5. Tasks
INSERT INTO public.tasks (id, user_id, title, due_date) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 1', '2026-04-10'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 2', '2026-04-11'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 3', '2026-04-12'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 4', '2026-04-13'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 5', '2026-04-14'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 6', '2026-04-15'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 7', '2026-04-16'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 8', '2026-04-17'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 9', '2026-04-18'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Görev 10', '2026-04-19');

-- 6. Notes
INSERT INTO public.notes (id, user_id, title, target_date) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 1', '2026-04-10'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 2', '2026-04-11'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 3', '2026-04-12'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 4', '2026-04-13'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 5', '2026-04-14'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 6', '2026-04-15'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 7', '2026-04-16'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Not 8', '2026-04-17');

-- 7. Notifications
INSERT INTO public.notifications (id, user_id, title, message) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 1', 'Mesaj 1'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 2', 'Mesaj 2'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 3', 'Mesaj 3'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 4', 'Mesaj 4'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 5', 'Mesaj 5'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 6', 'Mesaj 6'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 7', 'Mesaj 7'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 8', 'Mesaj 8'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 9', 'Mesaj 9'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bildirim 10', 'Mesaj 10');
