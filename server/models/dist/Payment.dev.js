"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Payment = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = new _mongoose["default"].Schema({
  chapa_transaction_id: {
    type: String,
    required: true
  },
  chapa_reference_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    "default": "ETB" // Ethiopian Birr is Chapa's default currency

  },
  status: {
    type: String,
    "enum": ["created", "success", "failed", "canceled"],
    "default": "created"
  },
  payment_method: {
    type: String,
    "enum": ["mobile_money", "bank", "card", null],
    "default": null
  },
  customer_info: {
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String
  },
  metadata: {
    type: Object,
    "default": {}
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  updatedAt: {
    type: Date,
    "default": Date.now
  }
}); // Update the updatedAt field before saving

schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

var Payment = _mongoose["default"].model("Payment", schema);

exports.Payment = Payment;