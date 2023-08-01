const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const helpers = require("../helpers/message");
const EmailService = require("../service/emailService");
const UserService = require("../service/UserService");
const db = require("../config/config");
const {
  ClientForgotPasswordMobileMailer,
  ClientForgotPasswordMailer,
} = require("../helpers/mailer/samples");
const sequelize = db;
/*const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    )

myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken()*/
const baseurl = process.env.BASE_URL;

// exports.emailVerification_V1 = async(req, res) => {
//     try {
//         const user = await User.findOne({ where: {
//             email: req.user.email
//         }})
//         if(user){
//             const token = jwt.sign({email: user.email}, process.env.TOKEN, { expiresIn: "15m"});
//             const link = `${process.env.BASE_URL}/email-verification?userId=${user.id}&token=${token}`;

//                 var transporter = nodemailer.createTransport({
//                     host: process.env.EMAIL_HOST,
//                         port: process.env.EMAIL_PORT,
//                         secure: true, // true for 465, false for other ports
//                         tls: {
//                         rejectUnauthorized: false,
//                         },
//                         ool: true,
//                         maxConnections: 1,
//                         rateDelta: 20000,
//                         rateLimit: 5,
//                         auth: {
//                         user: process.env.EMAIL_USERNAME, // generated ethereal user
//                         pass: process.env.EMAIL_PASSWORD, // generated ethereal password
//                         },
//                   });

//             const fname = user.fullname.split(' ')
//             const mailOptions = {
//                 from:  `${process.env.E_TEAM}`,
//                 to: `${user.email}`,
//                 subject: "Deepend",
//                 html: `<!DOCTYPE html>
//                 <html>
//                 <head>

//                   <meta charset="utf-8">
//                   <meta http-equiv="x-ua-compatible" content="ie=edge">
//                   <title>Email Confirmation</title>
//                   <meta name="viewport" content="width=device-width, initial-scale=1">
//                   <style type="text/css">
//                   /**
//                    * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
//                    */
//                   @media screen {
//                     @font-face {
//                       font-family: 'Source Sans Pro';
//                       font-style: normal;
//                       font-weight: 400;
//                       src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
//                     }
//                     @font-face {
//                       font-family: 'Source Sans Pro';
//                       font-style: normal;
//                       font-weight: 700;
//                       src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
//                     }
//                   }
//                   /**
//                    * Avoid browser level font resizing.
//                    * 1. Windows Mobile
//                    * 2. iOS / OSX
//                    */
//                   body,
//                   table,
//                   td,
//                   a {
//                     -ms-text-size-adjust: 100%; /* 1 */
//                     -webkit-text-size-adjust: 100%; /* 2 */
//                   }
//                   /**
//                    * Remove extra space added to tables and cells in Outlook.
//                    */
//                   table,
//                   td {
//                     mso-table-rspace: 0pt;
//                     mso-table-lspace: 0pt;
//                   }
//                   /**
//                    * Better fluid images in Internet Explorer.
//                    */
//                   img {
//                     -ms-interpolation-mode: bicubic;
//                   }
//                   /**
//                    * Remove blue links for iOS devices.
//                    */
//                   a[x-apple-data-detectors] {
//                     font-family: inherit !important;
//                     font-size: inherit !important;
//                     font-weight: inherit !important;
//                     line-height: inherit !important;
//                     color: inherit !important;
//                     text-decoration: none !important;
//                   }
//                   /**
//                    * Fix centering issues in Android 4.4.
//                    */
//                   div[style*="margin: 16px 0;"] {
//                     margin: 0 !important;
//                   }
//                   body {
//                     width: 100% !important;
//                     height: 100% !important;
//                     padding: 0 !important;
//                     margin: 0 !important;
//                   }
//                   /**
//                    * Collapse table borders to avoid space between cells.
//                    */
//                   table {
//                     border-collapse: collapse !important;
//                   }
//                   a {
//                     color: #1a82e2;
//                   }
//                   img {
//                     height: auto;
//                     line-height: 100%;
//                     text-decoration: none;
//                     border: 0;
//                     outline: none;
//                   }
//                   </style>

//                 </head>
//                 <body style="background-color: #e9ecef;">

//                   <!-- start preheader -->
//                   <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
//                     Deepend Email Verification
//                   </div>
//                   <!-- end preheader -->

//                   <!-- start body -->
//                   <table border="0" cellpadding="0" cellspacing="0" width="100%">

//                     <!-- start logo -->
//                     <tr>
//                       <td align="center" bgcolor="#e9ecef">
//                         <!--[if (gte mso 9)|(IE)]>
//                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//                         <tr>
//                         <td align="center" valign="top" width="600">
//                         <![endif]-->
//                         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
//                           <tr>
//                             <td align="center" valign="top" style="padding: 36px 24px;">
//                               <a href=${baseurl} target="_blank" style="display: inline-block;">
//                                 <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="60" style="display: flex; width: 60px; max-width: 60px; min-width: 60px;">
//                               </a>
//                             </td>
//                           </tr>
//                         </table>
//                         <!--[if (gte mso 9)|(IE)]>
//                         </td>
//                         </tr>
//                         </table>
//                         <![endif]-->
//                       </td>
//                     </tr>
//                     <!-- end logo -->

//                     <!-- start hero -->
//                     <tr>
//                       <td align="center" bgcolor="#e9ecef">
//                         <!--[if (gte mso 9)|(IE)]>
//                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//                         <tr>
//                         <td align="center" valign="top" width="600">
//                         <![endif]-->
//                         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
//                           <tr>
//                             <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
//                               <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
//                             </td>
//                           </tr>
//                         </table>
//                         <!--[if (gte mso 9)|(IE)]>
//                         </td>
//                         </tr>
//                         </table>
//                         <![endif]-->
//                       </td>
//                     </tr>
//                     <!-- end hero -->

//                     <!-- start copy block -->
//                     <tr>
//                       <td align="center" bgcolor="#e9ecef">
//                         <!--[if (gte mso 9)|(IE)]>
//                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//                         <tr>
//                         <td align="center" valign="top" width="600">
//                         <![endif]-->
//                         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

//                           <!-- start copy -->
//                           <tr>
//                             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
//                       <h2> Hi ${fname[0]}, </h2>
//                               <p style="margin: 0;"> You Have Successfully created an account with Deepend. Tap the button below to confirm your email address. If you didn't create an account with Deepend, you can safely delete this email.</p>
//                             </td>
//                           </tr>
//                           <!-- end copy -->

//                           <!-- start button -->
//                           <tr>
//                             <td align="left" bgcolor="#ffffff">
//                               <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                                 <tr>
//                                   <td align="center" bgcolor="#ffffff" style="padding: 12px;">
//                                     <table border="0" cellpadding="0" cellspacing="0">
//                                       <tr>
//                                         <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
//                                           <a href=${link} target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a>
//                                         </td>
//                                       </tr>
//                                     </table>
//                                   </td>
//                                 </tr>
//                               </table>
//                             </td>
//                           </tr>
//                           <!-- end button -->

//                           <!-- start copy -->
//                           <tr>
//                             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
//                               <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
//                               <p style="margin: 0;"><a href=${link} target="_blank">${link}</a></p>
//                             </td>
//                           </tr>
//                           <!-- end copy -->

//                           <!-- start copy -->
//                           <tr>
//                             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
//                               <p style="margin: 0;">Cheers,<br> Deepend Team</p>
//                             </td>
//                           </tr>
//                           <!-- end copy -->

//                         </table>
//                         <!--[if (gte mso 9)|(IE)]>
//                         </td>
//                         </tr>
//                         </table>
//                         <![endif]-->
//                       </td>
//                     </tr>
//                     <!-- end copy block -->

//                     <!-- start footer -->
//                     <tr>
//                       <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
//                         <!--[if (gte mso 9)|(IE)]>
//                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//                         <tr>
//                         <td align="center" valign="top" width="600">
//                         <![endif]-->
//                         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

//                           <!-- start permission -->
//                           <tr>
//                             <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
//                               <p style="margin: 0;">You received this email because we received a request for signing up for your DEEPEND account. If you didn't request signing up you can safely delete this email.</p>
//                             </td>
//                           </tr>
//                           <!-- end permission -->

//                         </table>
//                         <!--[if (gte mso 9)|(IE)]>
//                         </td>
//                         </tr>
//                         </table>
//                         <![endif]-->
//                       </td>
//                     </tr>
//                     <!-- end footer -->

//                   </table>
//                   <!-- end body -->

//                 </body>
//                 </html> `
//             };

//             transporter.sendMail(mailOptions, function(err, info) {
//                 if(err){
//                     console.log(err)
//                 } else {
//                     console.log(info);
//                     res.status(200).json({
//                         success: true,
//                         message: "An email has been sent to you, Check your inbox"
//                     })
//                 }
//             });

//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: "User email not found"})
//         }
//     } catch (error) {
//         console.error(error)
//        return res.status(500).json({
//             success: false,
//             message: "An error occured",
//             error: error
//         })
//     }
// };

// exports.emailVerification_V2 = async(req, res) => {
// try {
//         const token = req.query.token;
//         const id = req.query.userId
//         const decode = jwt.verify(token, process.env.TOKEN);
//         if(decode){
//                 await User.update({email_verify: true}, {where: {
//                     id: id
//                 }})
//                 res.status(200).json({
//                     success: true,
//                     message: "Email Verified successfully updated"})
//         }else{
//             res.status(403).json({
//                 success: false,
//                 message: "Invalid Link"
//             })
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//              success: false,
//              message: "An error occured",
//              error: error
//          })
// }

// }

// exports.checkEmail = async(req, res) => {
//     const {email} = req.body;
//     try {
//         const user = await User.findOne({ where: {
//             email: `${email}`
//         }})
//         //console.log(user);
//         if(user){
//             const token = jwt.sign({email: email}, process.env.TOKEN, { expiresIn: "15m"});
//             const link = `${process.env.BASE_URL}/reset-password/${user.id}/${token}`;
//             //console.log(link);
//                 var transporter = nodemailer.createTransport({
//                     host: process.env.EMAIL_HOST,
//                     port: process.env.EMAIL_PORT,
//                     secure: true, // true for 465, false for other ports
//                     tls: {
//                     rejectUnauthorized: false,
//                     },
//                     ool: true,
//                     maxConnections: 1,
//                     rateDelta: 20000,
//                     rateLimit: 5,
//                     auth: {
//                     user: process.env.EMAIL_USERNAME, // generated ethereal user
//                     pass: process.env.EMAIL_PASSWORD, // generated ethereal password
//                     },
//                   });

//             var firstname = user.fullname.split(' ');
//             const mailOptions = {
//                 from:  `${process.env.E_TEAM}`,
//                 to: `${user.email}`,
//                 subject: "Deepend",
//                 html: `
//                 <!DOCTYPE html>
// <html>
// <head>

//   <meta charset="utf-8">
//   <meta http-equiv="x-ua-compatible" content="ie=edge">
//   <title>Password Reset</title>
//   <meta name="viewport" content="width=device-width, initial-scale=1">
//   <style type="text/css">
//   /**
//    * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
//    */
//   @media screen {
//     @font-face {
//       font-family: 'Source Sans Pro';
//       font-style: normal;
//       font-weight: 400;
//       src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
//     }

//     @font-face {
//       font-family: 'Source Sans Pro';
//       font-style: normal;
//       font-weight: 700;
//       src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
//     }
//   }

//   /**
//    * Avoid browser level font resizing.
//    * 1. Windows Mobile
//    * 2. iOS / OSX
//    */
//   body,
//   table,
//   td,
//   a {
//     -ms-text-size-adjust: 100%; /* 1 */
//     -webkit-text-size-adjust: 100%; /* 2 */
//   }

//   /**
//    * Remove extra space added to tables and cells in Outlook.
//    */
//   table,
//   td {
//     mso-table-rspace: 0pt;
//     mso-table-lspace: 0pt;
//   }

//   /**
//    * Better fluid images in Internet Explorer.
//    */
//   img {
//     -ms-interpolation-mode: bicubic;
//   }

//   /**
//    * Remove blue links for iOS devices.
//    */
//   a[x-apple-data-detectors] {
//     font-family: inherit !important;
//     font-size: inherit !important;
//     font-weight: inherit !important;
//     line-height: inherit !important;
//     color: inherit !important;
//     text-decoration: none !important;
//   }

//   /**
//    * Fix centering issues in Android 4.4.
//    */
//   div[style*="margin: 16px 0;"] {
//     margin: 0 !important;
//   }

//   body {
//     width: 100% !important;
//     height: 100% !important;
//     padding: 0 !important;
//     margin: 0 !important;
//   }

//   /**
//    * Collapse table borders to avoid space between cells.
//    */
//   table {
//     border-collapse: collapse !important;
//   }

//   a {
//     color: #1a82e2;
//   }

//   img {
//     height: auto;
//     line-height: 100%;
//     text-decoration: none;
//     border: 0;
//     outline: none;
//   }
//   </style>

// </head>
// <body style="background-color: #e9ecef;">

//   <!-- start preheader -->
//   <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
//     Deepend Password Reset
//   </div>
//   <!-- end preheader -->

//   <!-- start body -->
//   <table border="0" cellpadding="0" cellspacing="0" width="100%">

//     <!-- start logo -->
//     <tr>
//       <td align="center" bgcolor="#e9ecef">
//         <!--[if (gte mso 9)|(IE)]>
//         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//         <tr>
//         <td align="center" valign="top" width="600">
//         <![endif]-->
//         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
//           <tr>
//             <td align="center" valign="top" style="padding: 36px 24px;">
//               <a href=${baseurl} target="_blank" style="display: inline-block;">
//                 <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="60" style="display: flex; width: 60px; max-width: 60px; min-width: 60px;">
//               </a>
//             </td>
//           </tr>
//         </table>
//         <!--[if (gte mso 9)|(IE)]>
//         </td>
//         </tr>
//         </table>
//         <![endif]-->
//       </td>
//     </tr>
//     <!-- end logo -->

//     <!-- start hero -->
//     <tr>
//       <td align="center" bgcolor="#e9ecef">
//         <!--[if (gte mso 9)|(IE)]>
//         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//         <tr>
//         <td align="center" valign="top" width="600">
//         <![endif]-->
//         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
//           <tr>
//             <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
//               <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>
//             </td>
//           </tr>
//         </table>
//         <!--[if (gte mso 9)|(IE)]>
//         </td>
//         </tr>
//         </table>
//         <![endif]-->
//       </td>
//     </tr>
//     <!-- end hero -->

//     <!-- start copy block -->

//     <tr>
//       <td align="center" bgcolor="#e9ecef">
//         <!--[if (gte mso 9)|(IE)]>
//         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//         <tr>
//         <td align="center" valign="top" width="600">
//         <![endif]-->
//         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

//           <!-- start copy -->
//           <tr>
//             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
//             <h2> Hi ${firstname[0]}, </h2>
//               <p style="margin: 0;">Tap the button below to reset your customer account password. If you didn't request a new password, you can safely delete this email.</p>
//             </td>
//           </tr>
//           <!-- end copy -->

//           <!-- start button -->
//           <tr>
//             <td align="left" bgcolor="#ffffff">
//               <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                 <tr>
//                   <td align="center" bgcolor="#ffffff" style="padding: 12px;">
//                     <table border="0" cellpadding="0" cellspacing="0">
//                       <tr>
//                         <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
//                           <a href=${link} target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//           <!-- end button -->

//           <!-- start copy -->
//           <tr>
//             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
//               <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
//               <p style="margin: 0;"><a href=#{link} target="_blank">${link}</a></p>
//             </td>
//           </tr>
//           <!-- end copy -->

//           <!-- start copy -->
//           <tr>
//             <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
//               <p style="margin: 0;">Cheers,<br> Deepend Team</p>
//             </td>
//           </tr>
//           <!-- end copy -->

//         </table>
//         <!--[if (gte mso 9)|(IE)]>
//         </td>
//         </tr>
//         </table>
//         <![endif]-->
//       </td>
//     </tr>
//     <!-- end copy block -->

//     <!-- start footer -->
//     <tr>
//       <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
//         <!--[if (gte mso 9)|(IE)]>
//         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
//         <tr>
//         <td align="center" valign="top" width="600">
//         <![endif]-->
//         <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

//           <!-- start permission -->
//           <tr>
//             <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
//               <p style="margin: 0;">You received this email because we received a request for password reset for your account. If you didn't request for password reset you can safely delete this email.</p>
//             </td>
//           </tr>
//           <!-- end permission -->
//         </table>
//         <!--[if (gte mso 9)|(IE)]>
//         </td>
//         </tr>
//         </table>
//         <![endif]-->
//       </td>
//     </tr>
//     <!-- end footer -->

//   </table>
//   <!-- end body -->

// </body>
// </html> `
//             };
//             transporter.sendMail(mailOptions, function(err, info) {
//                 if(err){
//                     console.log(err)
//                 } else {
//                     console.log(info);
//                     res.status(200).json({
//                         success: true,
//                         message: "An email has been sent to you, Check your inbox"
//                     })
//                 }
//             });

//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: "User email not found"})
//         }
//     } catch (error) {
//         console.error(error)
//        return res.status(500).json({
//             success: false,
//             message: "An error occured",
//             error: error
//         })
//     }
// };

// exports.forgotPassword = async(req, res) => {
//         const {new_password, confirm_password} = req.body;
//     try {
//             const token = req.params.token;
//             const decode = jwt.verify(token, process.env.TOKEN);
//             if(decode){
//                 if( new_password === confirm_password){
//                     const salt = await bcrypt.genSalt(12);
//                     const hashedPass = await bcrypt.hash(new_password, salt);

//                     await User.update({password: hashedPass}, {where: {
//                         id: `${req.params.id}`
//                     }})
//                     res.status(200).json({
//                         success: true,
//                         message: "User password successfully updated"})
//                 } else {
//                     res.status(406).json({
//                         success: false,
//                         message: "Password don't match"})
//                 }
//             }else{
//                 res.status(403).json({
//                     success: false,
//                     message: "Invalid Link"
//                 })
//             }

//         } catch (error) {
//             console.error(error)
//             return res.status(500).json({
//                  success: false,
//                  message: "An error occured",
//                  error: error
//              })
//     }

// }

exports.changePassword = async (req, res) => {
  const { password, new_password, confirm_password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (user) {
      const validate = await bcrypt.compare(password, user.password);
      if (validate) {
        if (new_password === confirm_password) {
          const salt = await bcrypt.genSalt(12);
          const hashedPass = await bcrypt.hash(new_password, salt);

          await User.update(
            { password: hashedPass },
            {
              where: {
                id: user.id,
              },
            }
          );
          res.status(202).json({
            success: true,
            message: "Password updated",
          });
        } else {
          res.status(406).json({
            success: false,
            message: "New password not equal to confirm password",
          });
        }
      } else {
        res.status(406).json({
          success: false,
          message: "Wrong password",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "User not logged in",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.adminChangePassword = async (req, res) => {
  const { password, new_password, confirm_password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (user) {
      const validate = await bcrypt.compare(password, user.password);
      if (validate) {
        if (new_password === confirm_password) {
          const salt = await bcrypt.genSalt(12);
          const hashedPass = await bcrypt.hash(new_password, salt);

          await User.update(
            { password: hashedPass },
            {
              where: {
                id: user.id,
              },
            }
          );
          res.status(202).json({
            success: true,
            message: "Password updated",
          });
        } else {
          res.status(406).json({
            success: false,
            message: "New password not equal to confirm password",
          });
        }
      } else {
        res.status(406).json({
          success: false,
          message: "Wrong password",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "User not logged in",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { email } = req.query;

      const user = await User.findOne({ where: {email} });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid user",
        });
      }

      let token = "";
        token = helpers.generateMobileToken();
        let message = helpers.forgotPasswordMessage(
          { email, first_name: user.fullname },
          token
        );
        await EmailService.sendMail(email, message, "Reset Password");

        // message = helpers.resetPasswordMobileMessage(token);
  // let message = helpers.resetPasswordMessage(email, token);
      
      // await EmailService.sendMail(email, message, "Reset Password");
      const data = {
         password_token: token,
        id: user.id,
      };
      await UserService.updateUser(data, t);
      return res.status(200).send({
        success: true,
        message: "Password Reset Email Sent Successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.resetPassword = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { email, token, password } = req.body;
const password_token = token
      const user = await UserService.findUser({ password_token, email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid user",
        });
      }

      // const currentPassword = bcrypt.hashSync(password, 10);
      const salt = await bcrypt.genSalt(12);
      const currentPassword = await bcrypt.hash(password, salt);
      const data = {
        password: currentPassword,
        id: user.id,
      };
      await UserService.updateUser(data, t);
      return res.status(200).send({
        success: true,
        message: "Password Changed Successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const user = await UserService.getUserDetails({ id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedpass = await bcrypt.hash(password, salt);
    const update = {
      password: hashedpass,
    };

    await User.update(update, { where: { id } });

    return res.status(200).send({
      success: true,
      message: "Password changed!",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};
