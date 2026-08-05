# 🏥 Hospital Management System (HMS)

A modern, role-based Hospital Management System built to streamline hospital operations, improve patient care, and centralize medical records. The application is designed as a real-world Hospital Information System (HIS) where each department works independently while sharing patient information through a centralized database.

---

# 📌 Project Vision

The goal of this project is to simulate a production-level hospital management platform used by hospitals to manage patients, staff, appointments, admissions, ICU monitoring, billing, and medical records.

Instead of building a simple CRUD application, this project focuses on solving real hospital workflows through proper database design, role-based access control, and department-specific dashboards.

---

# 🎯 Objectives

* Manage patients from registration to discharge.
* Centralize patient medical records.
* Reduce paperwork and duplicate records.
* Enable departments to collaborate efficiently.
* Provide secure access based on user roles.
* Maintain complete audit history of every important action.
* Generate reports for hospital administration.

---

# 👥 User Roles

## Super Admin

Responsible for managing the entire system.

### Permissions

* Manage hospitals (optional SaaS version)
* Manage departments
* Create administrators
* Configure system settings
* View analytics
* Access audit logs
* Monitor overall system activity

---

## Hospital Admin

Responsible for managing one hospital.

### Permissions

* Register staff
* Manage departments
* Assign user roles
* Manage doctors
* Manage nurses
* View hospital reports
* Manage beds
* Manage inventory
* View patient statistics

---

## Receptionist

Responsible for patient registration.

### Permissions

* Register new patients
* Search existing patients
* Book appointments
* Generate OPD tokens
* Check patients in
* Generate bills

---

## Doctor

Responsible for patient diagnosis and treatment.

### Permissions

* View assigned patients
* View patient history
* Record diagnosis
* Prescribe medicines
* Request laboratory tests
* Approve admissions
* Discharge patients
* Write clinical notes

---

## Nurse

Responsible for patient monitoring.

### Permissions

* Record vital signs
* Update patient condition
* Administer medication
* Record nursing notes
* Monitor ICU patients
* Complete shift reports

---

## Laboratory Staff

### Permissions

* Receive laboratory requests
* Perform laboratory tests
* Upload reports
* Notify doctors when reports are ready

---

## Pharmacist

### Permissions

* View prescriptions
* Dispense medicines
* Update medicine inventory
* Track stock availability

---

# 🏥 Core Modules

---

## Authentication

* Login
* Logout
* JWT Authentication
* Role-Based Authorization
* Password Reset
* Protected Routes

---

## Dashboard

Each role has its own dashboard displaying relevant information.

### Example Widgets

* Today's Patients
* Admissions
* Discharges
* ICU Occupancy
* Revenue
* Pending Bills
* Upcoming Appointments
* Doctor Availability
* Bed Availability

Charts include:

* Patient Trends
* Revenue Reports
* Admissions
* Department Performance
* Bed Occupancy

---

# Patient Management

The patient module acts as the heart of the system.

## Patient Information

* Medical Record Number (MRN)
* Name
* Age
* Gender
* Blood Group
* CNIC
* Phone Number
* Address
* Emergency Contact
* Insurance Information

---

## Medical Information

* Allergies
* Chronic Diseases
* Current Medications
* Previous Surgeries
* Family History

---

## Patient Timeline

Every patient has a complete medical timeline.

Example:

Patient Registered

↓

OPD Consultation

↓

Blood Test

↓

Hospital Admission

↓

Transferred to ICU

↓

Recovered

↓

Discharged

This provides doctors with a complete history instead of isolated records.

---

# OPD Module

Workflow:

Patient Registration

↓

Token Generation

↓

Doctor Assignment

↓

Vitals Recording

↓

Doctor Consultation

↓

Prescription

↓

Billing

↓

Visit Completed

---

## Recorded Information

* Blood Pressure
* Pulse
* Temperature
* Respiratory Rate
* Weight
* Height
* Symptoms
* Diagnosis
* Prescription

---

# ICU Management

The ICU module is one of the most advanced parts of the application.

## ICU Dashboard

Displays:

* ICU Beds
* Occupied Beds
* Available Beds
* Critical Patients
* Ventilator Usage
* Doctors On Duty
* Nurses On Shift

---

## ICU Patient Monitoring

Each ICU patient includes:

* Room Number
* Bed Number
* Ventilator Status
* Oxygen Support
* Heart Rate
* Pulse
* Blood Pressure
* Temperature
* Respiratory Rate
* Oxygen Saturation (SpO₂)
* Urine Output
* Glasgow Coma Scale (GCS)

---

## Vitals History

Instead of only showing the latest values, every reading is stored.

Example:

08:00 AM

↓

09:00 AM

↓

10:00 AM

↓

11:00 AM

Each vital sign can be displayed as a trend graph.

---

## Medication Administration

Medication schedules include:

* Medicine Name
* Dosage
* Time
* Administered By
* Status
* Timestamp

---

## Doctor Notes

Doctors can write clinical observations and treatment plans.

---

## Nursing Notes

Nurses can record shift updates, patient conditions, medication observations, and daily progress.

---

# IPD (Inpatient Department)

Manage admitted patients.

Features:

* Admission
* Room Assignment
* Bed Assignment
* Daily Progress
* Ward Transfers
* Discharge Summary

---

# Laboratory

Doctors can request tests.

Examples:

* CBC
* LFT
* MRI
* CT Scan
* X-Ray
* Ultrasound

Workflow:

Doctor Request

↓

Laboratory Processing

↓

Result Upload

↓

Doctor Notification

---

# Pharmacy

Features:

* Medicine Inventory
* Prescription Management
* Stock Updates
* Low Stock Alerts
* Medicine Dispensing

---

# Billing

Automatically calculate:

* Consultation Fees
* Admission Charges
* ICU Charges
* Ward Charges
* Laboratory Charges
* Pharmacy Charges
* Procedure Charges

Generate:

* Invoice
* Receipt
* Payment History

---

# Staff Management

Manage all hospital employees.

Staff Profile includes:

* Employee ID
* Name
* Photo
* Department
* Designation
* Role
* Contact Information
* Shift
* Joining Date

---

## Attendance

Track:

* Present
* Absent
* Late
* Leave

---

# Bed Management

Track every hospital bed.

Statuses include:

* Available
* Occupied
* Reserved
* Cleaning
* Maintenance

---

# Appointment Management

Features:

* Calendar View
* Doctor Availability
* Appointment Booking
* Rescheduling
* Cancellation
* Token Generation

---

# Reports & Analytics

Generate reports for:

* Daily Admissions
* Monthly Revenue
* OPD Visits
* ICU Occupancy
* Department Performance
* Laboratory Tests
* Medicine Usage
* Staff Performance

---

# Notifications

Examples:

* Medicine Due
* Laboratory Report Ready
* Critical Patient Alert
* Appointment Reminder
* Discharge Approved

---

# Audit Logs

Every important action is tracked.

Stored Information:

* User
* Action
* Previous Value
* New Value
* Timestamp
* IP Address

Example:

Doctor updated diagnosis

↓

Nurse recorded blood pressure

↓

Admin deleted user

---

# Database Modules

Hospital

├── Departments

├── Roles

├── Users

├── Patients

├── Appointments

├── Admissions

├── Beds

├── ICU Records

├── Vitals

├── Diagnoses

├── Prescriptions

├── Laboratory Tests

├── Pharmacy

├── Billing

├── Payments

├── Notifications

└── Audit Logs

---

# Technology Stack

## Frontend

* React
* React Router
* TanStack Query
* React Hook Form
* Zod
* Tailwind CSS
* Chart.js

---

## Backend

* Express.js
* Sequelize ORM
* PostgreSQL
* JWT Authentication
* Multer
* Bcrypt

---

# Future Enhancements

* Real-Time ICU Monitoring (WebSockets)
* SMS Notifications
* Email Notifications
* PDF Prescription Generation
* PDF Discharge Summary
* Barcode / QR Code Patient Wristbands
* Electronic Medical Records (EMR)
* Multi-Hospital Support
* AI-Based Patient Risk Prediction
* Voice Notes for Doctors
* Mobile Companion Application

---

# ⭐ Standout Features

* Complete Patient Timeline
* Role-Based Dashboards
* Department-Specific Workflows
* Real-Time ICU Monitoring
* Vitals Trend Graphs
* Bed Management Dashboard
* Audit Logging System
* Automated Billing
* Laboratory Workflow
* Pharmacy Inventory Management
* Secure Role-Based Access Control
* Production-Level Relational Database Design

---

# Project Goal

Build a production-ready Hospital Information System that demonstrates full-stack software engineering skills, including scalable architecture, relational database design, authentication, authorization, workflow automation, reporting, and healthcare-focused data management.
