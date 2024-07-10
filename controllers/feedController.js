const Feeds = require("../models/Feeds");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");
const { checkPermissions } = require("../utils");
const { sendSuccess, sendFail } = require("../utils/FormatResponse");
const BookMark = require("../models/BookMark");
const Likes = require("../models/Likes");
const paginate = require("../utils/paginate");

const createFeeds = async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }
    req.body.user = req.user.userId;
    req.body.feedImages = imageUrls;
    req.body.content = req.body.content;

    const feeds = await Feeds.create(req.body);
    sendSuccess(
      res,
      StatusCodes.CREATED,
      feeds,
      "Your feed has been created successfully",
    );
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAllFeeds = async (req, res) => {
  try {
    const paginationOptions = {
      cursorField: "createdAt",
      sort: { createdAt: -1 },
      limit: 10,
      populateOptions: [
        {
          path: "user",
          select: "-password",
        },
      ],
    };
    const paginationResult = await paginate(
      Feeds,
      req.query.cursor,
      paginationOptions,
    );
    sendSuccess(
      res,
      StatusCodes.OK,
      paginationResult,
      "Your feed fetched successfully",
    );
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching feeds", error: error.message });
  }
};

const getFeedById = async (req, res) => {
  try {
    const feed = await Feeds.findById(req.params.id)
      .populate([
        {
          path: "user",
          select: "-password",
        },
        {
          path: "comments",
        },
      ])
      .sort({ createdAt: -1 });
    // if (!feed) {
    //   sendFail(res, StatusCodes.NOT_FOUND, null, "Feed not found");
    //   return;
    // }
    sendSuccess(res, StatusCodes.OK, feed, "Your feed fetched successfully");
  } catch (error) {
    sendFail(res, StatusCodes.NOT_FOUND, null, error.message);
  }
};

const getFeedByUserId = async (req, res) => {
  const feeds = await Feeds.find({ user: req.params.userId })
    .populate("comments")
    .sort({ createdAt: -1 });
  sendSuccess(res, StatusCodes.OK, feeds, "Your feeds fetched successfully");
};

const getFeedByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });
    const feeds = await Feeds.find({ user: user._id })
      .populate([
        {
          path: "user",
          select: "-password",
        },
        {
          path: "comments",
        },
      ])
      .sort({ createdAt: -1 });
    sendSuccess(res, StatusCodes.OK, feeds, "Your feeds fetched successfully");
  } catch (error) {
    console.log(error);
  }
};

// TODO delete maybe no need to use it
const updateFeedById = async (req, res) => {
  res.send("update by id");
};

const deleteFeedById = async (req, res) => {
  const feedId = req.params.id;
  const feed = await Feeds.findById(feedId);

  if (!feed) {
    throw new CustomError.NotFoundError("Feed not found");
  }
  checkPermissions(req.user, feed.user);
  await feed.deleteOne();
  sendSuccess(
    res,
    StatusCodes.OK,
    null,
    "Your feed and related data deleted successfully",
  );
};

const searchFeeds = async (req, res) => {
  const keyword = req.body.keyword;
  const feeds = await Feeds.find({
    content: new RegExp(keyword, "i"),
  }).populate({
    path: "user",
    select: "-password",
  });
  const user = await User.find({ name: new RegExp(keyword, "i") });
  const searchRes = { feeds: feeds, user: user };
  sendSuccess(
    res,
    StatusCodes.OK,
    searchRes,
    "Your search result fetched successfully",
  );
};

const uploadImage = async (req) => {
  // if (!req.files || !req.files.image) {
  //   return null;
  // }
  // const FeedsImage = req.files.image;
  // if (!FeedsImage.mimetype.startsWith("image")) {
  //   throw new CustomError.BadRequestError("Please upload an image file");
  // }
  // const maxSize = 1024 * 1024;
  // if (FeedsImage.size > maxSize) {
  //   throw new CustomError.BadRequestError("File size should be less than 1MB");
  // }
  // const imagePath = path.join(
  //   __dirname,
  //   `../public/uploads/${FeedsImage.name}`,
  // );
  // await FeedsImage.mv(imagePath);
  // return `/uploads/${FeedsicImage.name}`;
};

module.exports = {
  createFeeds,
  getAllFeeds,
  getFeedById,
  getFeedByUserId,
  updateFeedById,
  deleteFeedById,
  searchFeeds,
  getFeedByUsername,
};
