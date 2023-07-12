const { check, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ message: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

const registerValidation = () => {
  return [
    check("name", "Name is required").notEmpty(),
    check("email", "Please use a valid Email").isEmail(),
    check("userType", "Enter The user type").notEmpty(),
    check(
      "password",
      "Please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ];
};

const adminValidation = () => {
  return [
    check("name", "Name is required").notEmpty(),
    check("email", "Please use a valid Email").isEmail(),
    check("userType", "Enter The user type").notEmpty(),
    check("level", "Enter The user type").isInt(),
    check(
      "password",
      "Please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ];
};

const loginValidation = () => {
  return [
    check("email", "Please use a valid Email").isEmail(),
    check(
      "password",
      "Please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ];
};

const facebookLoginValidation = () => {
  return [
    check("facebook_id", "Facebook ID is required!").notEmpty(),
    check("facebook_access_token", "Facebook access token is required!").notEmpty()
  ];
};

const googleLoginValidation = () => {
  return [check("google_id", "Google ID is required!").notEmpty()];
};

const facebookSignupValidation = () => {
  return [
    check("facebook_first_name", "Facebook first name is required!").notEmpty(),
    check("facebook_access_token", "Facebook access token is required!").notEmpty(),
    check("facebook_last_name", "Facebook last name is required!").notEmpty(),
    check("facebook_email", "Facebook email is required!").notEmpty(),
    check("facebook_id", "Facebook ID is required!").notEmpty(),
    check("user_type", "User type is required!").notEmpty(),
    check("company_name", "Company name is required!").notEmpty(),
  ];
};

const googleSignValidation = () => {
  return [
    check("access_token", "Google access token is required!").notEmpty(),
    check("user_type", "User type is required!").notEmpty(),
  ];
};

const appleSignValidation = () => {
  return [
    check("access_token", "Apple access token is required!").notEmpty(),
    check("user_type", "User type is required!").notEmpty(),
  ];
};

const resetAdminPasswordValidation = () => {
  return [
    check(
      "password",
      "Please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ];
};

const resetPasswordValidation = () => {
  return [
    check("email", "Please use a valid Email").isEmail(),
    check("token", "Reset tooken is required").notEmpty(),
    check(
      "password",
      "Please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ];
};

const changePasswordValidation = () => {
  return [
    check("oldPassword", "Please enter the Old Password").notEmpty(),
    check("newPassword", "Please enter new Password").notEmpty(),
    check("confirmPassword", "Confirm new Password").notEmpty(),
  ];
};

const contactValidation = () => {
  return [
    check("first_name", "First name is required!").notEmpty(),
    check("last_name", "Last name is required!").notEmpty(),
    check("email", "Email is required!").notEmpty(),
    check("phone", "Phone number is required!").notEmpty(),
    check("message", "Message is required!").notEmpty(),
  ];
};

const bankValidation = () => {
  return [
    check("bank_code", "Please Select a bank").notEmpty(),
    check("bank_name", "Please Select a bank").notEmpty(),
    check("account_number", "Please enter Account number").notEmpty(),
    check("account_name", "Please enter Account name").notEmpty(),
  ];
};

const meetingValidation = () => {
  return [
    check("description", "Account not found").notEmpty(),
    check("projectSlug", "Please Select a Project").notEmpty(),
    check("date", "Please enter meeting date").notEmpty(),
    check("time", "Please enter meeting time").notEmpty(),
    check("description", "Please describe the meeting").notEmpty(),
    check("requestEmail", "Unexpected error, try to login again").notEmpty(),
  ];
};

const addressValidation = () => {
  return [
    check("title", "Title is required").notEmpty(),
    check("address", "Address is required").notEmpty(),
    check("state", "State is required").notEmpty(),
    check("country", "Country is required").notEmpty(),
    check("charge", "Charge is required").notEmpty(),
  ];
};

const meetingStatusValidation = () => {
  return [
    check("meetingId", "Account not found").notEmpty(),
    check("status", "No action").notEmpty(),
  ];
};

const categoryValidation = () => {
  return [check("name", "Please Enter category name").notEmpty()];
};

const productValidation = () => {
  return [
    check("categoryId", "Please Select the category of product").isUUID(),
    check("name", "Please Enter a name").notEmpty(),
    check("description", "Please Enter a description").notEmpty(),
    check("price", "Please enter the product price").isNumeric(),
    check("quantity", "Please enter the quanity available").isNumeric(),
    check(
      "unit",
      "Please enter the unit measurement for this product"
    ).notEmpty(),
  ];
};

const productApprovalValidation = () => {
  return [
    check("productId", "Product id is required").isUUID(),
    check("status", "Please approval status").notEmpty(),
  ];
};

const orderValidation = () => {
  return [
    check("products", "Product is required").isArray(),
    check("shippingAddress", "Shipping address is required").notEmpty(),
  ];
};

const updateOrderValidation = () => {
  return [
    check("orderId", "Order Id is required").isUUID(),
    check("status", "Order status is required").notEmpty(),
  ];
};

const updateOrderRequestValidation = () => {
  return [
    check("requestId", "Request Id is required").isUUID(),
    check("status", "Order status is required").notEmpty(),
  ];
};

const TestimonyValidation = () => {
  return [
    check("message", "Message is required").notEmpty(),
    check("star", "Rating is required").isInt({ min: 0, max: 5 }),
  ];
};

const BlogCategoryValidation = () => {
  return [check("name", "name of category is required").notEmpty()];
};
const BlogValidation = () => {
  return [
    check("title", "Title is required").notEmpty(),
    check("categoryId", "No category selected").notEmpty(),
    check("status", "Status is required").notEmpty(),
    check("body", "body is required").notEmpty(),
  ];
};

const ServiceTypeValidation = () => {
  return [
    check("title", "Title is required").notEmpty(),
    check("description", "No category selected").notEmpty(),
    check("serviceId", "Service Type is required").isUUID(),
  ];
};

const ServiceValidation = () => {
  return [
    check("name", "Name is required!").notEmpty(),
    check("slug", "Slug is required!").notEmpty(),
    check("icon", "Icon is required!").notEmpty(),
  ];
};

const ServiceFormBuilderValidation = () => {
  return [
    check("serviceName", "Service Name is required").notEmpty(),
    check("label", "Label is required").notEmpty(),
    check("inputType", "Input Type is required").notEmpty(),
    check("name", "Name is required").notEmpty(),
  ];
};

const landSurveyRequestValidation = () => {
  return [
    check("title", "Project title is required").notEmpty(),
    check("propertyName", "Property Name is required").notEmpty(),
    check("propertyLocation", "property Location is required").notEmpty(),
    check("propertyLga", "property Lga is required").notEmpty(),
    check("landSize", "land Size is required").notEmpty(),
    check("propertyType", "property Type is required").notEmpty(),
    check("surveyType", "survey Type is required").notEmpty(),
  ];
};

const contractorRequestValidation = () => {
  return [
    check("title", "Project title is required").notEmpty(),
    check("clientName", "Client Name is required").notEmpty(),
    check("projectLocation", "project Location is required").notEmpty(),
    check("projectType", "project Type is required").notEmpty(),
    check("buildingType", "Building Type is required").notEmpty(),
  ];
};

const BasicKYCRequirements = () => {
  return [check("userType", "Couldn't get profile type").notEmpty()];
};
const CalculatorCalculator = () => {
  return [
    check("name", "Please provide the rate name").notEmpty(),
    check("rate", "Please provide the rate value").notEmpty(),
  ];
};

const KYCApprovalValidation = () => {
  return [
    check("userType", "userType is required").notEmpty(),
    check("userId", "userId is required").isUUID(),
    check("kycPoint", "Kycpoint is required").isInt(),
    check(
      "verificationStatus",
      "verificationStatus is required and it's boolean"
    ).isBoolean(),
  ];
};

const projectAssignmentRequestValidation = () => {
  return [
    check("userId", "userId is required").isUUID(),
    check("projectId", "projectId is required").isUUID(),
    check("duration", "duration is required").isNumeric(),
    check("totalCost", "totalCost is required").isNumeric(),
    check("estimatedCost", "estimatedCost is required").isNumeric(),
  ];
};

const projectInstallmentValidation = () => {
  return [
    check("title", "Title is required").notEmpty(),
    check("amount", "Amount is required").notEmpty(),
    check("project_slug", "Project slug is required").notEmpty()
  ];
};

const paymentInstallmentValidation = () => {
  return [
    check("amount", "Amount is required").notEmpty(),
    check("installmentId", "Installment ID is required").notEmpty()
  ];
};

const projectNotificationValidation = () => {
  return [
    check("body", "Body field is required").notEmpty(),
    check("project_slug", "Project slug is required").notEmpty()
  ];
};

const projectBidRequestValidation = () => {
  return [
    check("userId", "userId is required").isUUID(),
    check("projectId", "projectId is required").isUUID(),
    check("deliveryTimeLine", "deliveryTimeLine is required").isNumeric(),
    check("projectCost", "projectCost is required").isNumeric(),
    check("reasonOfInterest", "reasonOfInterest is required").notEmpty(),
  ];
};

const projectApplyRequestValidation = () => {
  return [
    check("userId", "userId is required").isUUID(),
    check("projectId", "projectId is required").isUUID(),
    check("areYouInterested", "areYouInterested is required").isBoolean(),
  ];
};

const projectProgressValidation = () => {
  return [check("percent", "percent is required").notEmpty()];
};

const subscriptionRequestValidation = () => {
  return [
    check("duration", "duration is required").isNumeric(),
    check("amount", "amount is required").isFloat(),
    check("name", "name is required").notEmpty(),
  ];
};

const subscribeRequestValidation = () => {
  return [
    check("userId", "userId is required").isUUID(),
    check("planId", "planId is required").isUUID(),
    check("reference", "reference is required").notEmpty(),
    check("userType", "userType is required").notEmpty(),
  ];
};

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  facebookLoginValidation,
  googleLoginValidation,
  facebookSignupValidation,
  googleSignValidation,
  appleSignValidation,
  resetPasswordValidation,
  resetAdminPasswordValidation,
  changePasswordValidation,
  bankValidation,
  categoryValidation,
  productValidation,
  productApprovalValidation,
  orderValidation,
  updateOrderValidation,
  updateOrderRequestValidation,
  BlogCategoryValidation,
  CalculatorCalculator,
  contactValidation,
  BlogValidation,
  TestimonyValidation,
  ServiceTypeValidation,
  landSurveyRequestValidation,
  contractorRequestValidation,
  adminValidation,
  meetingValidation,
  addressValidation,
  meetingStatusValidation,
  BasicKYCRequirements,
  KYCApprovalValidation,
  projectAssignmentRequestValidation,
  projectBidRequestValidation,
  projectApplyRequestValidation,
  projectProgressValidation,
  projectInstallmentValidation,
  paymentInstallmentValidation,
  projectNotificationValidation,
  subscriptionRequestValidation,
  subscribeRequestValidation,
  ServiceFormBuilderValidation,
  ServiceValidation,
};
