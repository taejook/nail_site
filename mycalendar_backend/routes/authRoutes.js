const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const auth = require("../middleware/auth"); // if you want /me protected
const { validateRegister, validateLogin } = require("../middleware/validator");

router.post("/register", validateRegister, authCtrl.register);
router.post("/login", validateLogin, authCtrl.login);
router.get("/me", auth, authCtrl.me);

module.exports = router;
