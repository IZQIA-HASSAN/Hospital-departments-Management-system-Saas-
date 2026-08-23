import { Op } from "sequelize";
// op stands for operators in sequelize , special object that holds comparison and logical symbols
import OPDVisit from "../models/Opdvisit.js";


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
            tokenNumber: tokennumber ,
            visitDate: today,
            status: "waiting",
            hospitalId: req.hospitalId, // FIX: was never included — this is what threw the notNull violation
        })
        return res.status(201).json({ message: "opd visit registered successfully", visit })

    } catch (err) {
        console.log("an err occured while registereing", err)
        return res.status(500).json({ message: "somethgin went wrong please try again" })
    }
}


// getting all the visits today 

export const getopdvisits = async (req, res) => {
    try {
        const { date, status, department } = req.query

        const where = { hospitalId: req.hospitalId } // scope to this hospital, same as the rest of the app now does

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
        if (visit.hospitalId !== req.hospitalId) {
            return res.status(404).json({ message: "OPD visit not found" }); // don't leak that it exists in another hospital
        }

        return res.status(200).json({ visit });
    } catch (err) {
        console.error("getOPDVisitById error:", err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}



//updating opd visits status

export const updatevisitstatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const allowedstatus = ["waiting", "in-progress", "cancelled", "completed"]

        if (!status || !allowedstatus.includes(status)) {
            return res.status(400).json({ message: `status ,ust be one of these ${allowedstatus.join(",")}` })
        }

        const visit = await OPDVisit.findByPk(id);
        if (!visit || visit.hospitalId !== req.hospitalId) {
            return res.status(404).json({ message: "OPD visit not found" });
        }

        visit.status = status
        await visit.save()
        return res.status(200).json({message : "visit status has been updated"})
    } catch (err) {
        console.error("updateOPDVisitStatus error:", err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}

// gets todays live queue

export const todayslivequeue = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]


        const queue = await OPDVisit.findAll({
            where: {
                visitDate: today,
                hospitalId: req.hospitalId,
                status: { [Op.in]: ["waiting", "in-progress"] },
            },
            order: [["tokenNumber", "ASC"]]
        })
        return res.status(200).json({ queue })
    } catch (err) {
        console.error("getTodayQueue error:", err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}

// deleting a visit recored

export const deleterecord = async (req, res)=>{
    try{
        const {id} = req.params

        const visit = await OPDVisit.findByPk(id)

            if(!visit || visit.hospitalId !== req.hospitalId){
                return res.status(404).json({message : "requested visit not found"})
            }

            await visit.destroy()
            return res.status(200).json({message : "the requested visit has been successfully deleted"})
    }catch(err){
        console.log("some error has occur" , err)
        return res.status(500).json({message : "something went wrong please try again"})
    }
}