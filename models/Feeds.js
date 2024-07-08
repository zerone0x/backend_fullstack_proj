const mongoose = require("mongoose");

const FeedsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [1000, "Content should be less than 1000 characters"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    feedImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

FeedsSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "feed",
  justOne: false,
});

FeedsSchema.pre("save", function (next) {
  if (!this.content && !this.feedImage) {
    next(new Error("Please provide either content or an image"));
  } else {
    next();
  }
});

FeedsSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function (next) {
    const query = this.getQuery();
    const feedId = query._id;
    if (feedId) {
      await mongoose.model("Comment").deleteMany({ feed: feedId });
      await mongoose.model("BookMark").deleteMany({ feed: feedId });
      await mongoose.model("Likes").deleteMany({ feed: feedId });
    }
    next();
  },
);

module.exports = mongoose.model("Feed", FeedsSchema);
