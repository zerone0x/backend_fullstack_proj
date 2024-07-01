const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils/index");
const passport = require("passport");
const { sendSuccess } = require("../utils/FormatResponse");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const ifEmailExist = await User.findOne({ email });
  if (ifEmailExist) {
    throw new CustomError.BadRequestError("Email already exist");
  }
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const user = await User.create({ email, name, password, role });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  const resUser = { user: user, tokenUser: tokenUser };
  sendSuccess(
    res,
    StatusCodes.CREATED,
    resUser,
    "Your account registered successfully",
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials of email");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new CustomError.UnauthenticatedError(
      "Invalid Credentials of password",
    );
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  req.session.user = user;
  const resUser = { user: user, tokenUser: tokenUser };
  sendSuccess(
    res,
    StatusCodes.CREATED,
    resUser,
    "Your account logined successfully",
  );
};

const RedirectGoogle = (req, res) => {
  const user = req.user;
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  req.session.user = user;
  const resUser = { user: user, tokenUser: tokenUser };
  if (user) {
    res.redirect(process.env.FE_URL);
  } else {
    res.send(req.user);
  }
};

const RedirectGithub = async (req, res) => {
  const user = req.user;
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  const resUser = { user: user, tokenUser: tokenUser };
  if (user) {
    res.redirect(process.env.FE_URL);
  } else {
    res.send(req.user);
  }
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 10),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  sendSuccess(res, StatusCodes.OK, null, "Logout successfully");
};

module.exports = {
  register,
  login,
  logout,
  RedirectGoogle,
  RedirectGithub,
};
