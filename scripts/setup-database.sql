-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  assigned_to VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  date_assigned DATE,
  notes TEXT,
  model_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_assigned_to ON devices(assigned_to);

-- Insert sample data
INSERT INTO devices (type, serial_number, assigned_to, status, date_assigned, notes)
VALUES
  ('Computer', 'COMP-001-2024', 'John Doe', 'Active', '2024-01-15', 'Main workstation'),
  ('Printer', 'PRNT-002-2024', 'Jane Smith', 'Active', '2024-01-20', 'Color printer'),
  ('Scanner', 'SCAN-003-2024', 'John Doe', 'Active', '2024-01-10', 'Document scanner'),
  ('SIM Card', 'SIM-004-2024', 'Sarah Wilson', 'Active', '2024-01-25', 'Company phone SIM'),
  ('Office Phone', 'PHONE-005-2024', 'John Doe', 'Maintenance', '2024-01-12', 'Needs new battery'),
  ('Computer', 'COMP-006-2024', NULL, 'Available', NULL, 'Spare laptop')
ON CONFLICT (serial_number) DO NOTHING;
