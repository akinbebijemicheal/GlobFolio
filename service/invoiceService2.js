/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const easyinvoice = require("easyinvoice");
const fs = require("fs");
const btoa = require("btoa");
const moment = require("moment");

const { invoice } = require("../helpers/invoice");
// const Product = require("../models/Product");

exports.createInvoice = async (orderData, user) => {
  // const { order_items, orderSlug, contact } = orderData;

  // console.log(orderData);

  // const myProduct = order_items.map((items) => {
  //   console.log(items.product);
  //   return {
  //     description: items.product.name.substring(0, 27),
  //     quantity: items.quantity,
  //     price: parseInt(items.product.price),
  //     "tax-rate": items.taxrate || 0,
  //   };
  // });

  // let _subtotal = 0;
  // let insurancecharge = 0
  // if (orderData.insuranceFee == true){
  //   insurancecharge = orderData.order_items[0].shippingAddress.deliveryaddress.insurancecharge
  // }
  // const _products = orderData.order_items.map((orderItem) => {
  //   // const productDetails = await Product.findOne({where: {id: }})
  //   _subtotal += orderItem.product.price * orderItem.quantity;
  //   return {
  //     description: orderItem.product.name,
  //     quantity: orderItem.quantity,
  //     price: orderItem.product.price.toLocaleString(),
  //     row_total: (orderItem.product.price * orderItem.quantity).toLocaleString(),
  //   };
  // });

  const invoiceData = {
    logo: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1669563824/BOG/logo_1_1_ubgtnr.png",
    document_title: "INVOICE",
    company_from: "13, Olufunmilola Okikiolu Street",
    zip_from: "Off Toyin Street, Ikeja",
    city_from: "Lagos State",
    country_from: "Nigeria",
    sender_custom_1: "",
    sender_custom_2: "",
    sender_custom_3: "",
    client: {
      // address_to: orderData.contact.home_address,
      // city_to: "",
      // country_to: orderData.contact.country,
      client_custom_1: "",
      client_custom_2: "",
      client_custom_3: "",
    },
    user: orderData.user,
    plan: orderData.plan,
    transaction: orderData.transaction,
    expiryDate: orderData.expiryDate,
  };

  console.log("Invoice Generator");
  const preparedInvoiceTemplate = invoice(invoiceData);
  const data = {
    customize: {
      template: btoa(preparedInvoiceTemplate),
      // template: fs.readFileSync("./index.html", "base64"),
    },
    // information: {
    //   logo:
    //     "https://res.cloudinary.com/greenmouse-tech/image/upload/v1689001814/globfolio/Group_48319_zrfe2h.png",
    //   "document-title": "BOG LTD",
    //   "company-from": "Sample Street 123",
    //   "zip-from": "1234 AB",
    //   "city-from": "Lagos",
    //   "country-from": "Nigeria",
    //   "sender-custom-1": "",
    //   "sender-custom-2": "",
    //   "sender-custom-3": "",
    //   client: {
    //     address_to: "Sample Home Address",
    //     city_to: "Lagos",
    //     country_to: "Nigeria",
    //     client_custom_1: "",
    //     client_custom_2: "",
    //     client_custom_3: "",
    //   },
    //   ref: orderSlug,
    //   date_ordered: "",
    //   delivery_address: "",
    //   delivery_date: "",
    //   products: [
    //     {
    //       description: "10 trips of sand",
    //       quantity: 2,
    //       price: 4000,
    //       row_total: 4000 * 2,
    //     },
    //   ],
    //   subtotal: 8000,
    //   delivery_fee: 500,
    //   total: 8500,
    // },
  };
  // Create your invoice! Easy!
  const result = await easyinvoice.createInvoice(data);
  // The response will contain a base64 encoded PDF file
  // console.log('PDF base64 string: ', result.pdf);
  fs.writeFileSync(
    `uploads/${orderData.user.fullname} Subscription.pdf`,
    result.pdf,
    "base64"
  );
  // easyinvoice.download('myInvoice.pdf', result.pdf);

  return true;
};
