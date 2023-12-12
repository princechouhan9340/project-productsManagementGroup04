const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    currencyId: {
      type: String,
      required: true,
      trim: true,
    },
    currencyFormat: {
      type: String,
      required: true,
      trim: true,
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    productImage: {
      type: String,
      required: true,
    }, // s3 link
    style: {
      type: String,
    },
    availableSizes: [
      {
        type: String,
        required: true,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
    ],
    installments: {
      type: Number,
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      // required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        rating: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      // required: true,
    },
    quantityAvailable: {
      type: Number,
      default: 0,
    },
    promotions: [
      {
        promoCode: String,
        discount: Number,
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
