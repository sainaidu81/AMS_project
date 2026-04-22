-- =========================================
-- Asset Management System
-- PostgreSQL Combined Schema Script
-- =========================================

-- Optional cleanup order if re-running manually:
-- DROP TABLE IF EXISTS asset_update_history CASCADE;
-- DROP TABLE IF EXISTS asset_assignments CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS assets CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP FUNCTION IF EXISTS set_updated_at();

-- =========================================
-- 1. Base Tables
-- =========================================

CREATE TABLE employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    service_tag VARCHAR(50) PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    manufactured_date DATE,
    ram VARCHAR(50),
    storage_capacity VARCHAR(50),
    operating_system VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. Dependent Tables
-- =========================================

CREATE TABLE users (
    employee_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'it_manager', 'employee')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE asset_assignments (
    id SERIAL PRIMARY KEY,
    service_tag VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    issued_by_emp_id VARCHAR(50) NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    host_name VARCHAR(150),
    return_date TIMESTAMP NULL,
    return_by_emp_id VARCHAR(50) NULL,
    asset_condition TEXT,
    issue_found BOOLEAN DEFAULT FALSE,
    issue_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_asset
        FOREIGN KEY (service_tag) REFERENCES assets(service_tag),
    CONSTRAINT fk_assignment_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_assignment_issued_by
        FOREIGN KEY (issued_by_emp_id) REFERENCES employees(employee_id),
    CONSTRAINT fk_assignment_return_by
        FOREIGN KEY (return_by_emp_id) REFERENCES employees(employee_id)
);

CREATE TABLE asset_update_history (
    id SERIAL PRIMARY KEY,
    service_tag VARCHAR(50) NOT NULL,
    updated_by_emp_id VARCHAR(50) NOT NULL,
    field_changed VARCHAR(100) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_note TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_update_asset
        FOREIGN KEY (service_tag) REFERENCES assets(service_tag),
    CONSTRAINT fk_update_employee
        FOREIGN KEY (updated_by_emp_id) REFERENCES employees(employee_id)
);

-- =========================================
-- 3. Trigger Function for updated_at
-- =========================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 4. Triggers
-- =========================================

CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_assignments_updated_at
BEFORE UPDATE ON asset_assignments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
