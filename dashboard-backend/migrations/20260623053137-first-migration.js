'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE hospitals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255)
    );

    CREATE TABLE services (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        service_name VARCHAR(255) NOT NULL
    );

    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL 
    );

    CREATE TABLE staff (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
        hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255),
        phone_number VARCHAR(50)
    );

    CREATE TABLE service_steps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        service_id UUID REFERENCES services(id) ON DELETE CASCADE,
        step_name VARCHAR(255) NOT NULL,
        step_order INTEGER NOT NULL
    );

    CREATE TABLE hospital_steps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
        step_id UUID REFERENCES service_steps(id) ON DELETE CASCADE,
        mid_threshold_minutes INTEGER NOT NULL DEFAULT 30,
        high_threshold_minutes INTEGER NOT NULL DEFAULT 60
    );

    CREATE TABLE visits (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(id) ON DELETE CASCADE,
        patient_identifier VARCHAR(100) NOT NULL,
        start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active' 
    );

    -- UPDATED: Step 8 - Visit Events with Queueing Logic
    CREATE TABLE visit_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
        hospital_step_id UUID REFERENCES hospital_steps(id) ON DELETE CASCADE,
        staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
        
        arrived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the patient joined the queue
        entered_at TIMESTAMP WITH TIME ZONE,                           -- When the doctor started (nullable)
        exited_at TIMESTAMP WITH TIME ZONE,                            -- When the step finished
        
        status VARCHAR(20) DEFAULT 'waiting',                          -- 'waiting', 'in_progress', 'completed'
        is_ml_flagged BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE staff_step_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
        hospital_step_id UUID REFERENCES hospital_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        visit_event_id UUID REFERENCES visit_events(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, 
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE support_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
        requester_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
        assigned_operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'open', 
        priority VARCHAR(50) DEFAULT 'medium', 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE IF EXISTS support_requests;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS staff_step_assignments;
    DROP TABLE IF EXISTS visit_events;
    DROP TABLE IF EXISTS visits;
    DROP TABLE IF EXISTS hospital_steps;
    DROP TABLE IF EXISTS service_steps;
    DROP TABLE IF EXISTS staff;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS services;
    DROP TABLE IF EXISTS hospitals;
  `);
};

exports._meta = {
  "version": 1
};