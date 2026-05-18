const express = require('express');
const { registerUser, authUser, getUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/').get(protect, admin, getUsers);
router.route('/:id').put(protect, admin, updateUserRole).delete(protect, admin, deleteUser);

module.exports = router;
