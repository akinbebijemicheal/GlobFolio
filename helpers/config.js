require("dotenv").config();

module.exports = {
  header: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
  },
  flw_header: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
  },
  MAXIMUM_NUMBER_OF_IMAGES_TO_UPLOAD: 5,
  VALID_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'PNG', 'pdf'],
  MAX_UPLOAD_IMAGE_SIZE: 50 * 1024 * 1024, // Bytes
};
