const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const nodemailer = require('nodemailer')

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
const baseurl = process.env.BASE_URL

exports.RegisterUser = async (role, req, res) => {
    try{

        const {firstname, lastname, email, phone_no, country, business, serviceType, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            res.status(302)
            req.flash("error", "User already exist")
            res.redirect("back")
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);
        
        if( role === 'user' || 'admin'){
            var verify = true
        }
        if(role === 'vendor'){
            var verify = false
        }

        user = new User({
            fullname: `${firstname} ${lastname}`,
            email,
            phone_no,
            country,
            serviceType,
            business,
            role,
            password: hashedPass,
            verified: verify
        });
    
        await user.save();

         user = await User.findOne({ where: {
            email: email
        }})
        
            const token = jwt.sign({email: user.email}, process.env.TOKEN, { expiresIn: "15m"});
            const link = `${process.env.BASE_URL}/email-verification/${user.id}/${token}`;

            if( process.env.ONTEST === 'REAL'){
                var transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        secure: true, // true for 465, false for other ports
                        tls: {
                        rejectUnauthorized: false,
                        },
                        auth: {
                        user: process.env.EMAIL_USERNAME, // generated ethereal user
                        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
                        },
                  });
            } else{
                var transporter = nodemailer.createTransport({
                    host: process.env.SMTP,
                    port: process.env.SMTPPORT,
                    auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASS
                    }
                });
            }
            
            let fname = user.fullname.split(' ')
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Deepend",
                html: `
                <!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
  /**
   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
   */
  @media screen {
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 400;
      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
    }
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 700;
      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
    }
  }
  /**
   * Avoid browser level font resizing.
   * 1. Windows Mobile
   * 2. iOS / OSX
   */
  body,
  table,
  td,
  a {
    -ms-text-size-adjust: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }
  /**
   * Remove extra space added to tables and cells in Outlook.
   */
  table,
  td {
    mso-table-rspace: 0pt;
    mso-table-lspace: 0pt;
  }
  /**
   * Better fluid images in Internet Explorer.
   */
  img {
    -ms-interpolation-mode: bicubic;
  }
  /**
   * Remove blue links for iOS devices.
   */
  a[x-apple-data-detectors] {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
    text-decoration: none !important;
  }
  /**
   * Fix centering issues in Android 4.4.
   */
  div[style*="margin: 16px 0;"] {
    margin: 0 !important;
  }
  body {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  /**
   * Collapse table borders to avoid space between cells.
   */
  table {
    border-collapse: collapse !important;
  }
  a {
    color: #1a82e2;
  }
  img {
    height: auto;
    line-height: 100%;
    text-decoration: none;
    border: 0;
    outline: none;
  }
  </style>

</head>
<body style="background-color: #e9ecef;">

  <!-- start preheader -->
  <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Deepend Email Verification
  </div>
  <!-- end preheader -->

  <!-- start body -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">

    <!-- start logo -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" valign="top" style="padding: 36px 24px;">
              <a href=${baseurl} target="_blank" style="display: inline-block;">
                <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
              </a>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end logo -->

    <!-- start hero -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      <h2> Hi ${fname[0]}, </h2>        
              <p style="margin: 0;"> You Have Successfully created an account with Deepend. Tap the button below to confirm your email address. If you didn't create an account with Deepend, you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start button -->
          <tr>
            <td align="left" bgcolor="#ffffff">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                          <a href=${link} target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- end button -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
              <p style="margin: 0;"><a href=${link} target="_blank">${link}</a></p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
              <p style="margin: 0;">Cheers,<br> Deepend Team</p>
            </td>
          </tr>
          <!-- end copy -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end copy block -->

    <!-- start footer -->
    <tr>
      <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start permission -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
              <p style="margin: 0;">You received this email because we received a request for [type_of_action] for your account. If you didn't request [type_of_action] you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end permission -->

          <!-- start unsubscribe -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
              <p style="margin: 0;">To stop receiving these emails, you can <a href="https://sendgrid.com" target="_blank">unsubscribe</a> at any time.</p>
              <p style="margin: 0;">Paste 1234 S. Broadway St. City, State 12345</p>
            </td>
          </tr>
          <!-- end unsubscribe -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end footer -->

  </table>
  <!-- end body -->

</body>
</html>`
            };

            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                    req.flash('error', "An error occured")
                } else {
                    console.log(info);
                    req.flash('success', "Registration successful")
                    res.redirect(`login-${role}`)
                }
            });

    }catch(error){
        console.error(error)
        //res.status(500)
        req.flash("error", "An error occured refresh the page")
        res.redirect("back")
    }
};


exports.webLoginUser = async (role, req, res) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user){

            res.status(404)
           req.flash("warning", 'User does not exist');
           res.redirect("back")

        }

        if(user.role !== role){
           // res.status(401)
          req.flash("warning", "Please ensure you are logging-in from the right portal" );
          res.redirect("back")
        }
        
        const validate = await bcrypt.compare(password, user.password);
        if(validate){

            let token = jwt.sign(
                { 
                fullname: user.fullname,
                email: user.email,
                role: user.role, 
                id: user.id}, 
                process.env.TOKEN, { expiresIn: 24 * 60 * 60});

            let result = {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                phone_no: user.phone_no,
                country: user.country,
                serviceType: user.serviceType,
                address: user.address,
                expiresIn: '24 hours',
                verified: user.verified,
                email_verify: user.email_verify,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            };

            var option = {
                httpOnly: true,
                signed: true,
                sameSite: true,
                secure: (process.env.NODE_ENV !== 'development'),
                secret: process.env.CSECRET
            }
            
            

            //res.status(200)
            req.flash("success", "Successfully logged in");
            res.cookie("jwt", token, option);
            res.redirect(`/dashboard/${role}`)

            

             

        } else{
           //res.status(403)
          req.flash("warning", 'Wrong password');
          res.redirect("back")
        }


    } catch(error){
        console.error(error)
      // res.status(500)
      req.flash("error", "An error occured refresh the page")
      res.redirect("back")
    }
};


exports.userAuth = passport.authenticate('jwt', {session: true});



exports.profile = user => {
   return {
        id: user.id,
        fullname: user.fullname,
        phone_no: user.phone_no,
        country: user.country,
        serviceType: user.serviceType,
        email: user.email,
        address: user.address,
        sub_status: user.sub_status,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
       };

};


exports.getUsers = async (req, res)=>{
    try {
        const users = await User.findAll({where: {role: 'user'}})
        if (users){
            return res.status(200).json({
                status: true,
                data: users})
        } else{
            res.status(404).json({
                status: false,
                message: "No user found"})
        }
       
    } catch (error) {
        console.error(error)
        res.status(500)
        req.flash("error", "An error occured refresh the page")
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({where: 
            { 
                username: req.params.username
            }
        })
        if (user){
            return res.status(200).json({
                status: true,
                message: user})
        } else{
            return res.status(404).json({
                status: false,
                message: "No user found"})
        }

    } catch (error) {
        console.error(error)
        res.status(500)
       req.flash("error", "An error occured refresh the page")
       res.redirect("back")
    }
};

exports.updateUser = async(req, res) => {
    //const { fullname, email, phone_no, country, serviceType} = req.body
    try{
        await User.update( /* {
            fullname: fullname,
            phone_no: phone_no,
            country: country,
            serviceType: serviceType,
            email: email,
        }*/ req.body, { where: 
            {
            email: req.user.email
            }
        });

        const user = await User.findOne({
            where: {
                email: req.user.email
            }
        })
       return res.status(200).json({
            status: true,
            message: "Updated successfully",
            data: user
        })
    } catch(error){
        console.error(error)
        res.status(500)
        req.flash("error", "An error occured refresh the page")
        res.redirect("back")
    }
}

exports.deleteUser = async(req, res) => {
    try{
        const user = await User.destroy({ where: {
            email: req.user.email}
        });
        
        return res.status(200).json({
            status: true,
            message: "Updated successfully",
             
        })
    } catch(error){
        console.error(error)
        res.status(500)
       req.flash("error", "An error occured refresh the page")
       res.redirect("back")
    }
};

exports.checkRole = roles => (req, res, next) => {
if(!roles.includes(req.user.role)){ 
    return res.status(401).json({
        status: false,
        message: "Unauthorized"}) 
    }
   return next();
};

