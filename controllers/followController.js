const Follow = require("../models/Follow");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const { sendSuccess } = require("../utils/FormatResponse");

const AddFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;
    const idolId = req.body.idolId;
    if (userId === idolId) {
      throw new CustomError.BadRequestError("You cannot follow yourself");
    }
    const existingIdol = await Follow.findOne({
      followed: idolId,
      follower: userId,
    });
    if (existingIdol) {
      const deletedFollow = await Follow.findOneAndDelete({
        followed: idolId,
        follower: userId,
      });
      sendSuccess(
        res,
        StatusCodes.OK,
        deletedFollow,
        "your follow deleted successfully",
      );
      return;
    }
    const followPattern = await Follow.create({
      followed: idolId,
      follower: userId,
    });
    sendSuccess(
      res,
      StatusCodes.CREATED,
      followPattern,
      "your follow created successfully",
    );
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: error.message || "Failed to follow your mate",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;
    const following = await Follow.find({ follower: userId }).populate([
      {
        path: "followed",
        select: "-password -email",
      },
    ]);
    const data = {
      length: following.length,
      ppl: following.map((f) => f.followed),
    };
    sendSuccess(
      res,
      StatusCodes.CREATED,
      data,
      "your following fetched successfully",
    );
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: error.message || "Failed to fetch your following",
    });
  }
};

const getFans = async (req, res) => {
  try {
    const userId = req.user.userId;
    const followedPpl = await Follow.find({ followed: userId }).populate([
      {
        path: "follower",
        select: "-password -email",
      },
    ]);
    const data = {
      length: followedPpl.length,
      ppl: followedPpl.map((f) => f.follower),
    };
    sendSuccess(
      res,
      StatusCodes.CREATED,
      data,
      "your followedPpl fetched successfully",
    );
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: error.message || "Failed to fetch your followedPpl",
    });
  }
};

module.exports = {
  AddFollowing,
  getFollowing,
  getFans,
};