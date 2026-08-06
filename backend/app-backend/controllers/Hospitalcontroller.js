import Hospital from "../models/Hospital.js";

// port route api.hospital
//  methof post

export const createhospital = async (req, res) => {
    try {
        const { name, address, city, phone } = req.body;
        if (!name || !address || !city || !phone) {
            return res.status(400).json({ message: "all fields are required , fill all" })
        }
        const existing = await Hospital.findOne({ where: { adminId: req.user.id } })

        // check if hospital exists , if exist throw an error else 
        if (existing) {
            return res.status(400).json({ message: "you have already registered" })
        }

        // creating a new hospital 

        const hospital = await Hospital.create({
            name,
            address,
            city,
            phone,
            adminId: req.user.id,
        })
        res.status(201).json({ hospital })
    } catch (err) {

        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// @route  GET /api/hospitals/me
// @access Private (admin only)

export const getmyhospital = async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ where: { adminId: req.user.id } })
        res.status(200).json({ hospital })
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}