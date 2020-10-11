const express = require('express');
const verifyToken = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.get('/',  verifyToken, userController.index);
router.get('/:userId', verifyToken, userController.findUser);
router.put('/:userId',  verifyToken, userController.editUser);
router.delete('/:userId', verifyToken, userController.deleteUser);
router.post('/new', verifyToken, userController.newUser);
router.post('/login', userController.login);

module.exports = router;