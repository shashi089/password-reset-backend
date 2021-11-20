const router = require("express").Router();
const services = require("../services/services");
const servicePassword = require("../services/forgot-password");

router.post("/register", services.register);
router.post("/login", services.login);
router.post("/login/forgot-password", servicePassword.forgotPassword);
router.get("/forgot-password/:userId/:token", servicePassword.linkVerify);
router.post("/forgot-password/:userId/:token", servicePassword.updatePassword);
router.post("/login", services.login);

module.exports = router;
