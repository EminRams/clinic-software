-- ============================================================
-- DATABASE SCHEMA - CLINIC MANAGEMENT SOFTWARE (Honduras)
-- PostgreSQL 15+
-- Multi-tenant: each clinic is an independent tenant
--
-- AUDIT CONVENTION: every table includes
--   created_at, created_by, updated_at, updated_by, status
-- created_by / updated_by reference users(id).
-- Since users itself needs these columns (self-reference) and
-- clinics <-> users have a circular relationship, those two
-- FKs are added at the end via ALTER TABLE once all tables exist.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for encrypting sensitive columns
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- for UUID generation

-- ------------------------------------------------------------
-- Generic trigger: auto-update "updated_at" on every UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. CLINICS (main tenant)
-- ------------------------------------------------------------
CREATE TABLE clinics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(150) NOT NULL,
    tax_id              VARCHAR(14),          -- RTN for SAR invoicing
    cai                 VARCHAR(50),          -- SAR "Clave de Autorizacion de Impresion", valid range
    range_start         BIGINT,
    range_end           BIGINT,
    current_sequence    BIGINT DEFAULT 0,     -- next invoice number to issue
    cai_expiration_date DATE,
    main_specialty      VARCHAR(100),         -- e.g. "Pediatrics", "General Medicine"
    phone               VARCHAR(20),
    address             TEXT,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID,                 -- FK to users(id) added later
    updated_at          TIMESTAMPTZ,
    updated_by          UUID,                 -- FK to users(id) added later
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 2. USERS (system login: doctors, front desk, admin)
-- ------------------------------------------------------------
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    doctor_id           UUID,                 -- set if this user is also a doctor (see doctors table)
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
    -- Note: role no longer lives here as a fixed column.
    -- See "ROLES & PERMISSIONS" section below: user -> N roles -> N permissions.
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Now that users exists, close the circular FK from clinics
ALTER TABLE clinics
    ADD CONSTRAINT fk_clinics_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    ADD CONSTRAINT fk_clinics_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- ------------------------------------------------------------
-- 3. DOCTORS (medical profile, several per clinic)
-- ------------------------------------------------------------
CREATE TABLE doctors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id),
    full_name           VARCHAR(150) NOT NULL,
    specialty           VARCHAR(100),
    license_number      VARCHAR(50),          -- Colegio Medico de Honduras registration
    digital_signature_url TEXT,               -- for prescriptions/clinical notes
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ADD CONSTRAINT fk_users_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id);

-- ============================================================
-- ROLES & PERMISSIONS (RBAC)
-- Model: user -> N roles -> N permissions
-- Permissions are action-based (e.g. "patients.view",
-- "invoices.void"), not full-screen based, so they can be
-- combined granularly.
-- ============================================================

-- ------------------------------------------------------------
-- 4. PERMISSIONS (global catalog of system actions)
-- Not tied to a clinic: the "patients.edit" action is the same
-- action regardless of which clinic is using the system.
-- ------------------------------------------------------------
CREATE TABLE permissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'patients.view', 'clinical_notes.edit'
    module              VARCHAR(50) NOT NULL,          -- e.g. 'patients', 'appointments', 'invoices' (UI grouping)
    description         TEXT NOT NULL,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 5. ROLES (each clinic manages its own)
-- clinic_id NULL = system template (Admin, Doctor, Front Desk)
-- automatically cloned when a new clinic is created.
-- clinic_id NOT NULL = role owned by that clinic (clinics can
-- create custom roles, e.g. "Nurse", "Billing Clerk").
-- ------------------------------------------------------------
CREATE TABLE roles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    is_template         BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE only for the 3 global templates
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (clinic_id, name)
);

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 6. ROLE_PERMISSIONS (N to N: what each role can do)
-- ------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id       UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TRIGGER trg_role_permissions_updated_at
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 7. USER_ROLES (N to N: a user can hold several roles,
-- e.g. a doctor who also manages the clinic)
-- ------------------------------------------------------------
CREATE TABLE user_roles (
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 8. SEED: initial permission catalog by module
-- ------------------------------------------------------------
INSERT INTO permissions (code, module, description) VALUES
    ('patients.view',           'patients',       'View patient list and data'),
    ('patients.create',         'patients',       'Register new patients'),
    ('patients.edit',           'patients',       'Edit patient data'),
    ('appointments.view',       'appointments',   'View appointment schedule'),
    ('appointments.create',     'appointments',   'Book new appointments'),
    ('appointments.cancel',     'appointments',   'Cancel or reschedule appointments'),
    ('clinical_notes.view',     'clinical_notes', 'View patient clinical record'),
    ('clinical_notes.create',   'clinical_notes', 'Create visit notes'),
    ('clinical_notes.edit',     'clinical_notes', 'Edit existing visit notes'),
    ('prescriptions.create',    'prescriptions',  'Issue prescriptions'),
    ('charges.view',            'charges',        'View recorded charges'),
    ('charges.create',          'charges',        'Record visit charges'),
    ('invoices.create',         'invoices',       'Issue SAR-compliant invoices'),
    ('invoices.void',           'invoices',       'Void an issued invoice'),
    ('users.manage',            'users',          'Create users and assign roles'),
    ('reports.view',            'reports',        'View clinic reports and statistics');

-- ------------------------------------------------------------
-- 9. FUNCTION + TRIGGER: when a new clinic is created, clone the
-- 3 role templates (Admin, Doctor, Front Desk) with their permissions
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_default_clinic_roles()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id       UUID;
    doctor_role_id      UUID;
    front_desk_role_id  UUID;
BEGIN
    -- Admin: all permissions
    INSERT INTO roles (clinic_id, name, description)
        VALUES (NEW.id, 'Admin', 'Full access to the clinic')
        RETURNING id INTO admin_role_id;
    INSERT INTO role_permissions (role_id, permission_id)
        SELECT admin_role_id, id FROM permissions;

    -- Doctor: clinical record, prescriptions, appointments, view patients
    INSERT INTO roles (clinic_id, name, description)
        VALUES (NEW.id, 'Doctor', 'Clinical care of patients')
        RETURNING id INTO doctor_role_id;
    INSERT INTO role_permissions (role_id, permission_id)
        SELECT doctor_role_id, id FROM permissions
        WHERE code IN (
            'patients.view','appointments.view','appointments.create',
            'clinical_notes.view','clinical_notes.create','clinical_notes.edit',
            'prescriptions.create','charges.create'
        );

    -- Front Desk: scheduling, patients, billing -- NO access to clinical notes
    INSERT INTO roles (clinic_id, name, description)
        VALUES (NEW.id, 'Front Desk', 'Scheduling and billing, no clinical record access')
        RETURNING id INTO front_desk_role_id;
    INSERT INTO role_permissions (role_id, permission_id)
        SELECT front_desk_role_id, id FROM permissions
        WHERE code IN (
            'patients.view','patients.create','patients.edit',
            'appointments.view','appointments.create','appointments.cancel',
            'charges.view','charges.create','invoices.create'
        );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_roles
    AFTER INSERT ON clinics
    FOR EACH ROW EXECUTE FUNCTION create_default_clinic_roles();

-- ------------------------------------------------------------
-- 10. PATIENTS
-- ------------------------------------------------------------
CREATE TABLE patients (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    full_name           VARCHAR(150) NOT NULL,
    national_id         VARCHAR(20),          -- Honduran identity number
    date_of_birth       DATE,
    sex                 VARCHAR(1) CHECK (sex IN ('M','F')),
    phone               VARCHAR(20),          -- used for WhatsApp reminders
    email               VARCHAR(150),
    address             TEXT,
    -- general (non-sensitive) background
    blood_type          VARCHAR(5),
    allergies           TEXT,
    emergency_contact_name  VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_national_id ON patients(national_id);

CREATE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 11. APPOINTMENTS (schedule)
-- ------------------------------------------------------------
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id),
    doctor_id           UUID NOT NULL REFERENCES doctors(id),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INT DEFAULT 30,
    reason              VARCHAR(255),
    appointment_status  VARCHAR(20) DEFAULT 'scheduled'
                        CHECK (appointment_status IN ('scheduled','confirmed','completed','cancelled','no_show')),
    reminder_sent       BOOLEAN DEFAULT FALSE,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, scheduled_at);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, scheduled_at);

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Note: "appointment_status" (scheduled/confirmed/completed/...) is the
-- workflow state of the visit, kept separate from the generic audit
-- "status" boolean (active/inactive record).

-- ------------------------------------------------------------
-- 12. CLINICAL NOTES
-- Sensitive data lives here -> consider column-level encryption
-- at the application layer or with pgcrypto.
-- ------------------------------------------------------------
CREATE TABLE clinical_notes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id),
    doctor_id           UUID NOT NULL REFERENCES doctors(id),
    appointment_id      UUID REFERENCES appointments(id),
    visit_date          TIMESTAMPTZ NOT NULL DEFAULT now(),
    chief_complaint     TEXT,
    -- SOAP format: Subjective, Objective, Assessment (diagnosis), Plan
    subjective          TEXT,
    objective           TEXT,
    diagnosis           TEXT,           -- candidate for pgcrypto encryption
    treatment_plan      TEXT,
    icd10_code          VARCHAR(10),    -- optional ICD-10 code for reporting
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id);

CREATE TRIGGER trg_clinical_notes_updated_at
    BEFORE UPDATE ON clinical_notes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 13. PRESCRIPTIONS
-- ------------------------------------------------------------
CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_note_id    UUID NOT NULL REFERENCES clinical_notes(id) ON DELETE CASCADE,
    medications         JSONB NOT NULL,  -- [{name, dosage, frequency, duration}, ...]
    general_instructions TEXT,
    pdf_url             TEXT,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 14. CHARGES (payment recorded per visit/service)
-- ------------------------------------------------------------
CREATE TABLE charges (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id),
    appointment_id      UUID REFERENCES appointments(id),
    concept             VARCHAR(255) NOT NULL,       -- e.g. "General consultation", "Ultrasound"
    amount               NUMERIC(10,2) NOT NULL,
    payment_method       VARCHAR(20) CHECK (payment_method IN ('cash','card','bank_transfer')),
    charge_status        VARCHAR(20) DEFAULT 'pending' CHECK (charge_status IN ('pending','paid','voided')),
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_charges_updated_at
    BEFORE UPDATE ON charges
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Note: "charge_status" (pending/paid/voided) is the payment workflow
-- state, kept separate from the generic audit "status" boolean.

-- ------------------------------------------------------------
-- 15. INVOICES (SAR compliance - Honduras)
-- ------------------------------------------------------------
CREATE TABLE invoices (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    charge_id           UUID NOT NULL REFERENCES charges(id),
    sequence_number     VARCHAR(19) NOT NULL,        -- format NNN-NNN-NN-NNNNNNNN
    cai                 VARCHAR(50) NOT NULL,
    issuer_tax_id       VARCHAR(14) NOT NULL,
    customer_tax_id     VARCHAR(14),                  -- NULL if "Final Consumer"
    customer_name       VARCHAR(150),
    subtotal            NUMERIC(10,2) NOT NULL,
    isv_15              NUMERIC(10,2) DEFAULT 0,
    isv_18              NUMERIC(10,2) DEFAULT 0,
    total                NUMERIC(10,2) NOT NULL,
    issued_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    pdf_url              TEXT,
    voided                BOOLEAN NOT NULL DEFAULT FALSE,
    -- audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ,
    updated_by          UUID REFERENCES users(id),
    status              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX idx_invoices_sequence ON invoices(clinic_id, sequence_number);

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SECURITY: Row-Level Security (example on clinical_notes)
-- Every query is scoped to the logged-in user's clinic
-- (the app must run SET app.current_clinic_id = '<uuid>' per session)
-- ============================================================
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinical_notes_by_tenant ON clinical_notes
    USING (clinic_id = current_setting('app.current_clinic_id')::UUID);

-- Repeat ENABLE ROW LEVEL SECURITY + a similar policy on:
-- patients, appointments, prescriptions, charges, invoices

-- ============================================================
-- SAMPLE QUERY: get all effective permissions for a user
-- (union across all of their roles). The backend runs this at
-- login and stores the result in the JWT/session, so it doesn't
-- have to hit the database on every request.
-- ============================================================
-- SELECT DISTINCT p.code
-- FROM user_roles ur
-- JOIN role_permissions rp ON rp.role_id = ur.role_id
-- JOIN permissions p ON p.id = rp.permission_id
-- WHERE ur.user_id = '<user-uuid>'
--   AND ur.status = TRUE
--   AND p.status = TRUE;
