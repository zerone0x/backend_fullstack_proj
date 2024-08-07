const { StatusCodes } = require("http-status-codes");
const Notification = require("../models/Notification");
const { checkPermissions } = require("../utils");
const { sendSuccess, sendFail } = require("../utils/FormatResponse");

const GetAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ receiver: userId })
      .populate([
        {
          path: "sender",
          select: "-password",
        },
        {
          path: "receiver",
          select: "-password",
        },
        {
          path: "content",
        },
      ])
      .sort({
        createdAt: -1,
      });
    const unreadCount = await Notification.countDocuments({
      receiver: userId,
      status: "unread",
      action: { $ne: "bookmark" },
    });
    sendSuccess(
      res,
      StatusCodes.OK,
      { notifications, unreadCount },
      "Your notifications fetched successfully",
    );
  } catch (error) {
    sendFail(res, StatusCodes.INTERNAL_SERVER_ERROR, null, error.message);
  }
};

const MarkRead = async (req, res) => {
  try {
    const notificationId = req.body.notificationId;
    const notification = await Notification.findById(notificationId);
    notification.status = "read";
    await notification.save();
    sendSuccess(
      res,
      StatusCodes.OK,
      null,
      "Your notification marked as read successfully",
    );
  } catch (error) {
    sendFail(res, StatusCodes.INTERNAL_SERVER_ERROR, null, error.message);
  }
};

const GetUnReadCount = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  GetAllNotifications,
  MarkRead,
};
