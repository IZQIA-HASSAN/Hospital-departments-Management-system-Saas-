import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Hospital from "./Hospital.js";
import Staff from "./Staff.js";

// IMPORTANT: a row here represents a PHYSICAL BED, not a single admission.
// It persists across the vacant -> occupied -> cleaning -> vacant cycle.
// Patient fields (patientName, age, diagnosis, etc.) are a snapshot of
// whoever currently occupies the bed and are cleared/overwritten as the
// bed turns over. See controllers/ICUcontroller.js addPatient() for how
// this is enforced.
const IcuBed = sequelize.define(
  "IcuBed",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bedNumber: {
      type: DataTypes.STRING, // e.g. "ICU-01" — unique per hospital, enforced below
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("vacant", "occupied", "cleaning"),
      allowNull: false,
      defaultValue: "vacant",
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    assignedStaffId: {
      type: DataTypes.UUID,
      allowNull: true, // bed can be open with no nurse/doctor assigned yet
      references: { model: Staff, key: "id" },
    },

    // --- current patient snapshot (mirrors OPDVisit's level of detail) ---
    patientName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM("critical", "serious", "stable"),
      allowNull: true,
    },
    admittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dischargedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    disposition: {
      type: DataTypes.ENUM("discharged", "transferred", "deceased"),
      allowNull: true,
    },
  },
  {
    tableName: "icu_beds",
    timestamps: true,
    indexes: [
      // Enforces "unique per hospital, not globally" — previously only a
      // comment, not a real constraint, which let duplicate bed numbers
      // pile up per hospital.
      {
        unique: true,
        fields: ["hospitalId", "bedNumber"],
        name: "icu_beds_hospital_bed_number_unique",
      },
    ],
  }
);

// Associations — one hospital has many ICU beds
Hospital.hasMany(IcuBed, { foreignKey: "hospitalId", as: "icuBeds" });
IcuBed.belongsTo(Hospital, { foreignKey: "hospitalId", as: "hospital" });

// one staff member can be assigned to many ICU beds (e.g. a nurse covering a ward)
Staff.hasMany(IcuBed, { foreignKey: "assignedStaffId", as: "assignedBeds" });
IcuBed.belongsTo(Staff, { foreignKey: "assignedStaffId", as: "assignedStaff" });

export default IcuBed;