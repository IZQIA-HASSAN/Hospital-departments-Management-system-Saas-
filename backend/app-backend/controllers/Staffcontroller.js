import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';

// creating staff member
export const addstaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // FIX: was requiring `title` but never using it, and building
    // Staff.create({ name, email, role }) with `role` undefined — that
    // threw a ReferenceError. Now consistently uses `role`, matching the
    // model and the frontend form.
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await Staff.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Staff with this email already exists' });
    }

    // FIX: password must never be stored as plain text — hash it.
    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'staff',
    });

    // broadcasting to any active admin in dashboard, using websocket concept here
    const io = req.app.get('io');
    if (io) io.emit('staff:added', staff);

    // never send the password hash back to the client
    const { passwordHash: _omit, ...safeStaff } = staff.toJSON();
    res.status(201).json(safeStaff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// getting staff members
export const getstaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      // FIX: exclude passwordHash from the response
      attributes: { exclude: ['passwordHash'] },
      // FIX: 'iosOnline' typo -> 'isOnline', and DESC must be a string, not
      // a bare identifier (which threw a ReferenceError)
      order: [
        ['isOnline', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// deleting staff member
export const delstaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: 'staff not found' });
    }
    await staff.destroy();

    // updating websocket also after deleting
    const io = req.app.get('io');
    if (io) io.emit('staff:deleted', id);

    res.json({ message: 'staff member is deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FIX: this was `export default { delstaff, getstaff, addstaff }` (a
// default export) while Staffroutes.js used a NAMED import — that mismatch
// was the exact crash in your error log. Switched every function above to
// a named export (`export const ...`) so the named import now resolves.