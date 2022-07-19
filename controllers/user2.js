const User = require('../model/user');
const Restaurant = require('../model/restuarant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../middleware/keys');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { session } = require('passport');
const baseurl = process.env.BASE_URL
const store = require('store')


exports.RegisterAdmin = async (req, res, next) => {
    try{

        const {email, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            // res.status(302).json({
            //     status: false,
            //     message: "User already exist"
            // })
            req.flash("error", "User already exist")
            res.redirect("back")
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);
        
        
        

        user = new User({
            fullname: "Admin",
            email,
            password: hashedPass,
            role: "admin",
            email_verify: true
        });
    
        const Newuser = await user.save();
        // res.status(200).json({
        //     status: true,
        //     data: Newuser
        // })
        req.flash('success', "Registration successful")
         res.redirect(`login-admin`);

    }catch(error){
        console.error(error)
        // res.status(500).json({
        //     status: false,
        //     message: error
        // })
        // next(error)
        req.flash("error", "An error occured refresh the page")
        res.redirect("back")
        next(error)
    }
};


exports.webLoginAdmin = async (req, res, next) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user || user === null){
            req.flash("warning", 'User does not exist');
            res.redirect("back")
        }else if(user.role !== "admin"){
            // res.status(401).json({
            //     status: false,
            //     message: 'Please ensure you are logging-in from the right portal'
            // })
          req.flash("warning", "Please ensure you are logging-in from the right portal");
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
                token: `Bearer ${token}`,
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                expiresIn: '24 hours',
                email_verify: user.email_verify,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            };

            var option = {
                httpOnly: true,
                signed: true,
                sameSite: true,
                secure: (keys.NODE_ENV !== 'development'),
                secret: process.env.CSECRET
            }

            // res.json({
            //     status: true,
            //     data: result
            // })
            
            

            res.status(200)
            req.flash("success", "Successfully logged in");
            res.cookie("jwt", token, option);
            res.redirect(`/dashboard/admin`)

            

             

        } else{
           res.status(403)
          req.flash("warning", 'Wrong password');
          res.redirect("back")
        // res.status(404).json({
        //     status: false,
        //     message: "User not found"
        // })
       
        }


    } catch(error){
        console.error(error);
        // res.status(500).json({
        //     status: false,
        //     message: error
        // });
        // next(error);
      req.flash("error", "An error occured refresh the page")
      res.redirect("back")
      next(error)
    }
};


exports.userAuth = passport.authenticate('jwt', {failureRedirect: '/login-admin', session: true});



exports.profile = user => {
     return {
        id: user.id,
        fullname: user.fullname,
        phone_no: user.phone_no,
        country: user.country,
        email: user.email,
        address: user.address,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    };

};

exports.createAdmin = async(req, res, next)=>{
    const {email, password, role} = req.body;
    try {
        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            // res.status(302).json({
            //     status: false,
            //     message: "User already exist"
            // })
            req.flash("error", "User already exist")
            res.redirect("back")
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPass,
            role: role,
            email_verify: true
        });
    
        const Newuser = await user.save();
        res.status(200).json({
            status: true,
            data: Newuser
        })


    } catch (error) {
        console.error(error);
        next(error)
    }
}


exports.getUsers = async (req, res, next)=>{
    try {
        const users = await User.findAll({where: {role: 'user'}, raw: true})
        if (users){
            store.set("users", JSON.stringify(users));
            console.log('users:',users)
           // res.status(200)
            //res.send(users)
                // return res.status(200).json({
                // status: true,
                // data: users});
                next();
           
        } else{
            res.status(404).json({
                status: false,
                message: "No user found"})
        }
       
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
        // req.flash("error", "An error occured refresh the page")
    }
};

exports.getUser = async (req, res, next) => {
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    //    req.flash("error", "An error occured refresh the page")
    //    res.redirect("back")
    }
};

exports.updateUser = async(req, res, next) => {
    try{
        await User.update( req.body, { where: 
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    }
}

exports.updateUserPassword = async(req, res, next) => {
    try{
        console.log(req)
    //     await User.update( req.body, { where: 
    //         {
    //         email: req.user.email
    //         }
    //     });

    //     const user = await User.findOne({
    //         where: {
    //             email: req.user.email
    //         }
    //     })
    //    return res.status(200).json({
    //         status: true,
    //         message: "Updated successfully",
    //         data: user
    //     })
    } catch(error){
        console.error(error)
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    }
}

exports.updateUserForgot = async(req, res, next) => {
    try{
        const email= req.body.email;
console.log(email)
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        const token = jwt.sign({email: email}, process.env.TOKEN, { expiresIn: "15m"});
            const link = `${process.env.BASE_URL}/email-verification?userId=${user.id}&token=${token}`;

            
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
            
            
            let fname = user.fullname.split(' ')
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Deepend Forgot Password",
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
    Deepend Forgot Password
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
                <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="60" style="display: flex; width: 60px; max-width: 60px; min-width: 60px;">
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Click The Button Below To Submit New Password</h1>
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
              <p style="margin: 0;"> You entered your email to change password, click the link below to update the password, you can safely delete the email if you didnt request for it.</p>
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
              <p style="margin: 0;">You received this email because we received a request for signing up for your DEEPEND account. If you didn't request signing up you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end permission -->

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
                } else {
                    console.log(info);
                    return res.status(201).json({
                        status: true,
                        message: "An email has been sent to you, Check your inbox"
                    })
                }
            });

    }catch(error){
        console.error(error)
        res.status(500).json({
             status: false,
             message: "Error occured",
             error: error
         });
        next(error);
    }
};

      

exports.deleteUser = async(req, res, next) => {
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    }
};


exports.checkRole = roles => (req, res, next) => {
if(!roles.includes(req.user.role)){ 
    return res.status(401).json({
        status: false,
        message: "Unauthorized login pls"}) 
    }
   return next();
};

