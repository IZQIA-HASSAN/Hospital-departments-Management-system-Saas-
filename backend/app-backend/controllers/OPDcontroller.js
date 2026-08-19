import { Op } from "sequelize";
// op stands for operators in sequelize , special object that holds comparison and logical symbols
import OPDVisit from "../models/Opdvisit";


// registering an opd visit 

export const registeropdvisit = async (req, res) => {
    try {
        const { patientName, age, gender, contact, department, doctorName, reason } = req.body
        if (!patientName || !age || !gender || !contact || !department) {
            return res.status(400).json({ message: "patientName , age , gender  , contact , department fields are required !" })
        }

        const today = new Date().toISOString().split("T")[0]// this gives todays date

        // getting lastmost visit for todays

        const lastvisit = await OPDVisit.findOne({
            where: { visitDate: today },
            order: [["tokenNumber", "DESC"]]
        })

        const tokennumber = lastvisit ? lastvisit.tokenNumber + 1 : 1;

        const visit = await OPDVisit.create({
            patientName,
            age,
            gender,
            contact,
            department,
            doctorName,
            reason,
            tokenNumber,
            visitDate: today,
            status: "waiting",
        })
        return res.status(201).json({ message: "opd visit registered successfully" })

    } catch (err) {
        console.log("an err occured while registereing", err)
        return res.status(500).json({ message: "somethgin went wrong please try again" })
    }
}


// getting all the visits today 

export const getopdvisits = async (req, res) => {
    try {
        const { date, status, department } = req.query

        const where = {}

        if (date) where.visitDate = date;
        if (status) where.status = status;
        if (department) where.department = department;

        const visits = await OPDVisit.findAll({
            where,
            order: [
                ["visitDate", "DESC"],
                ["tokenNumber", "ASC"],
            ],
        })
        return res.status(200).json({ visits })
    } catch (err) {
        console.error("getOPDVisits error:", err);
        res.status(500).json({ message: "Something went wrong. Please try again." })
    }
}

// lets get a single opd visit 

export const getOPDVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await OPDVisit.findByPk(id);
 
    if (!visit) {
      return res.status(404).json({ message: "OPD visit not found" });
    }
 
    return res.status(200).json({ visit });
  } catch (err) {
    console.error("getOPDVisitById error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}



// 