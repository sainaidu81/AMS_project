BEGIN;

-- 1. Make columns nullable where ON DELETE SET NULL is required
ALTER TABLE asset_assignments
    ALTER COLUMN issued_by_emp_id DROP NOT NULL,
    ALTER COLUMN return_by_emp_id DROP NOT NULL;

ALTER TABLE asset_update_history
    ALTER COLUMN updated_by_emp_id DROP NOT NULL;

-- 2. Update FK on users
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS fk_users_employee,
    ADD CONSTRAINT fk_users_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

-- 3. Update FKs on asset_assignments
ALTER TABLE asset_assignments
    DROP CONSTRAINT IF EXISTS fk_assignment_asset,
    DROP CONSTRAINT IF EXISTS fk_assignment_employee,
    DROP CONSTRAINT IF EXISTS fk_assignment_issued_by,
    DROP CONSTRAINT IF EXISTS fk_assignment_return_by,
    ADD CONSTRAINT fk_assignment_asset
        FOREIGN KEY (service_tag)
        REFERENCES assets(service_tag)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assignment_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assignment_issued_by
        FOREIGN KEY (issued_by_emp_id)
        REFERENCES employees(employee_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assignment_return_by
        FOREIGN KEY (return_by_emp_id)
        REFERENCES employees(employee_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

-- 4. Update FKs on asset_update_history
ALTER TABLE asset_update_history
    DROP CONSTRAINT IF EXISTS fk_update_asset,
    DROP CONSTRAINT IF EXISTS fk_update_employee,
    ADD CONSTRAINT fk_update_asset
        FOREIGN KEY (service_tag)
        REFERENCES assets(service_tag)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    ADD CONSTRAINT fk_update_employee
        FOREIGN KEY (updated_by_emp_id)
        REFERENCES employees(employee_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

COMMIT;
