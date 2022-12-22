const express = require('express');
const router = express.Router();
const {authenticateUser, authorizePermission} = require('../middleware/authentication');

const {
    getAllUsers,
    getSingleUsers,
    showCurrentUsers,
    updateUsers,
    updateUserPassword,
} = require('../controllers/userController');


router.route('/').get(authenticateUser, authorizePermission('admin'), getAllUsers);
router.route('/showMe').get(authenticateUser, showCurrentUsers);
router.route('/updateUser').patch(authenticateUser, updateUsers);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
router.route('/:id').get(authenticateUser, getSingleUsers);


module.exports = router;