-- Insert sample data for Hesu Investment Limited
INSERT INTO devices (type, serial_number, assigned_to, status, date_assigned, notes)
VALUES
  ('Computer', 'COMP-001-2024', 'John Doe', 'Active', '2024-01-15', 'Main workstation - Dell OptiPlex 7090'),
  ('Printer', 'PRNT-002-2024', 'Jane Smith', 'Active', '2024-01-20', 'Color laser printer - HP LaserJet Pro'),
  ('Scanner', 'SCAN-003-2024', 'John Doe', 'Active', '2024-01-10', 'Document scanner - Canon imageFORMULA'),
  ('SIM Card', 'SIM-004-2024', 'Sarah Wilson', 'Active', '2024-01-25', 'Company phone SIM - MTN Corporate'),
  ('Office Phone', 'PHONE-005-2024', 'John Doe', 'Maintenance', '2024-01-12', 'Desk phone - needs new battery'),
  ('Computer', 'COMP-006-2024', NULL, 'Available', NULL, 'Spare laptop - Lenovo ThinkPad'),
  ('Printer', 'PRNT-007-2024', 'Michael Brown', 'Active', '2024-02-01', 'Black and white printer - Brother HL-L2350DW'),
  ('Scanner', 'SCAN-008-2024', NULL, 'Available', NULL, 'Portable scanner - Epson WorkForce'),
  ('SIM Card', 'SIM-009-2024', 'Emily Davis', 'Active', '2024-02-05', 'Mobile data SIM - Airtel Business'),
  ('Office Phone', 'PHONE-010-2024', 'Sarah Wilson', 'Active', '2024-01-30', 'Conference room phone - Polycom'),
  ('Computer', 'COMP-011-2024', 'David Johnson', 'Active', '2024-02-10', 'Desktop computer - HP EliteDesk'),
  ('SIM Card', 'SIM-012-2024', 'Michael Brown', 'Active', '2024-02-12', 'Backup phone SIM - Glo Corporate'),
  ('Printer', 'PRNT-013-2024', NULL, 'Maintenance', NULL, 'Large format printer - needs servicing'),
  ('Scanner', 'SCAN-014-2024', 'Emily Davis', 'Active', '2024-02-15', 'High-speed scanner - Fujitsu ScanSnap'),
  ('Office Phone', 'PHONE-015-2024', NULL, 'Available', NULL, 'Spare desk phone - Cisco IP Phone')
ON CONFLICT (serial_number) DO NOTHING;
