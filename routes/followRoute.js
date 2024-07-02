const express = require("express");
const router = express.Router();
const {
  AddFollowing,
  getFollowing,
  getFans,
} = require("../controllers/followController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

router.route("/AddFollow/").post([authenticateUser], AddFollowing);
router.route("/getFollow/:username").get(getFollowing);
router.route("/getFans/:username").get(getFans);
module.exports = router;
