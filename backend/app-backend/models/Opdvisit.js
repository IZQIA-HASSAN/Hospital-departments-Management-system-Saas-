import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Hospital from "./Hospital.js";

const OPDVisit = sequelize.define(
  "OPDVisit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Was missing entirely — every hospital's OPD visits lived in one
    // unscoped pool with nothing tying a row to a hospital. Any query
    // without an explicit filter would leak across hospitals.
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    patientName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    gender: { type: DataTypes.ENUM("male", "female", "other"), allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    doctorName: { type: DataTypes.STRING, allowNull: true },
    reason: { type: DataTypes.TEXT, allowNull: true },
    tokenNumber: { type: DataTypes.INTEGER, allowNull: false },
    visitDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM("waiting", "in-progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "waiting",
    },
  },
  {
    tableName: "opd_visits",
    timestamps: true,
    indexes: [
      // Two concurrent registrations on the same day could otherwise both
      // read the same "last token" and compute the same next number. This
      // catches that race at the DB level; the controller catches the
      // resulting error and retries once (see registeropdvisit).
      {
        unique: true,
        fields: ["hospitalId", "visitDate", "tokenNumber"],
        name: "opd_visits_hospital_date_token_unique",
      },
    ],
  }
);

Hospital.hasMany(OPDVisit, { foreignKey: "hospitalId", as: "opdVisits" });
OPDVisit.belongsTo(Hospital, { foreignKey: "hospitalId", as: "hospital" });

export default OPDVisit;