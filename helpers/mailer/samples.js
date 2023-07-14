const { mailer_template, Mailer, Logo } = require("./Engine");

module.exports = {



  /**
   * Mailer for super admins and project admins on project commencement
   * @param {{name: string, userType: string, id: string}} user
   * @param {[]} admins
   * @param {{fee: number, ref: string}} trx
   * @param {{}} _project
   */



  /**
   * Mailer for forgot password
   * @param {{email: string, first_name: string}} user
   * @param {string} token
   */
  ClientForgotPasswordMailer: async (user, token) => {
    const { email, first_name } = user;

    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    const link = `${process.env.SITE_URL}/resetpassword?email=${email}&token=${token}`;

    params.body = `<p style="font-size:1.7em;"><b>Hi, ${first_name}</b></p>`;
    params.body += `
                    <p style="font-size: 1.4em;">This is to inform you that you just initiated a password change action.</p><br/>
                    <p style="font-size: 1.4em;">To reset your password, you have to click the button below!</p>
                    <p style="font-size: 1.4em;">If this was not initiated by you, do not proceed.</p>
                `;
    params.body += `
                    <p style="margin-top:30px; font-size: 1em;">
                        <a href="${link}" target="_BLANK" title="Reset Password" style="padding: 15px;color:white;font-size:1em;background-color:#000;text-decoration:none;border-radius:5px;border:0">Reset Password</a>
                    </p>
                `;
    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Password reset`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        throw Promise.reject(err);
      });
  },

  /**
   * Mailer for forgot password for mobile
   * @param {{email: string, first_name: string}} user
   * @param {string} token
   */
  ClientForgotPasswordMobileMailer: async (user, token) => {
    const { email, first_name } = user;

    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    params.body = `<p style="font-size:1.7em;"><b>Hi, ${first_name}</b></p>`;
    params.body += `
                    <p style="font-size: 1.4em;">This is to inform you that you requested to change your password.</p><br/>
                    <h3 style="font-size: 1.4em;">${token}</h3>
                    <p style="font-size: 1.4em;">Use the token to reset your password!</p>
                    <p style="font-size: 1.4em;">If this was not initiated by you, do not proceed.</p>
                `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Password reset`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        throw Promise.reject(err);
      });
  },



  /**
   * Mailer for updating orders for clients
   * @param {{}} user
   * @param {string} status
   * @param {{}} trx
   */


  /**
   * Mailer for suspending a user by admin to user
   * @param {{first_name:string, email:string}} client
   * @param {string} reason
   */
  AdminSuspendUserMailerForUser: async (client, reason) => {
    const { first_name, email } = client;

    // setup mail credentials
    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    params.body = `<p style="font-size:1.7em;"><b>Hi, ${
      !first_name ? "user" : first_name
    }</b></p>`;
    params.body += `
                  <p style="font-size: 1.4em;">This is to inform you that your account has been suspended.</p><br/>
                  <p style="font-size: 1.4em;"><b>Reason for suspension:</b></p>
                  <p style="font-size: 1.2em;">${reason}</p>
              `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Account suspension`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },

  /**
   * Mailer for suspending a user by admin to admin
   * @param {{}} client
   * @param {[]} admins
   * @param {{}} reason
   */
  AdminSuspendUserMailerForAdmin: async (client, admins, reason) => {
    // Get super admin email addresses
    let admin_emails = [];
    admins.forEach((admin) => {
      admin_emails.push(admin.email);
    });

    const { first_name, last_name, email } = client;

    // setup mail credentials
    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    params.body = `<p style="font-size:1.7em;"><b>Hi, Administrator</b></p>`;
    params.body += `
                  <p style="font-size: 1.4em;">This is to inform you a user's account [${
                    !first_name ? "user" : `${first_name} ${last_name}`
                  }] has been suspended.</p><br/>
                  <p style="font-size: 1.4em;">Email: ${email}</p>
                  <p style="font-size: 1.4em;">Reason: ${reason}</p>
              `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email: admin_emails,
      subject: `Account suspension [${!first_name ? "user" : first_name}]`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },

  /**
   * Mailer for new signup for clients
   * @param {{first_name:string, email:string}} client
   */
  clientWelcomeMessage: async (client) => {
    const { first_name, email } = client;

    // setup mail credentials
    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    const link = `${process.env.SITE_URL}/shop`;
    const link2 = `${process.env.SITE_URL}/services`;

    params.body = `<p style="font-size:1.7em;"><b>Welcome to ${
      process.env.APP_NAME
    }, ${!first_name ? "user" : first_name}</b></p>`;
    params.body += `
                  <p style="font-size: 1.4em;">We are glad to have on board and can't wait for you to start enjoying the amazing features we offer.</p><br/>
                  <p style="font-size: 1.4em;">You can proceed to <a href="${link}">placing your orders</a>, <a href="${link2}">requesting for a service</a> etc.</p>
                  <p style="font-size: 1.4em;">Thanks for registering with us.</p><br/>
                  <p style="font-size: 1.4em;">Regards, <br/></p>
                  <p style="font-size: 1.4em;">${process.env.APP_NAME} team.</p>
              `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Welcome`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },


  /**
   * Mailer of complaint to iuser
   * @param {{first_name:string, email:string}} user
   * @param {{issue_type, issue_no, title, description, status}} issue
   */
  complaintMessageToUser: async (user, issue) => {
    const { first_name, email } = user;
    const { issue_type, issue_no, title, description, status } = issue;

    // setup mail credentials
    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    const link = `${process.env.SITE_URL}/dashboard/complaints`;

    params.body = `<p style="font-size:1.7em;"><b>Welcome to ${
      process.env.APP_NAME
    }, ${!first_name ? "user" : first_name}</b></p>`;
    params.body += `
                  <p style="font-size: 1.4em;">This is to inform you that you just made a complaint for the ticket issue ${issue_type} has been sent.</p><br/>
                  <p style="font-size: 1.4em;">Status: ${status}</p>
                  <p style="font-size: 1.4em;">Issue No: ${issue_no}</p><br/>
                  <p style="font-size: 1.4em;">Title: ${title}</p>
                  <p style="font-size: 1.4em;">Description:</p>
                  <p style="font-size: 1.2em;">${description}</p>
                  <p style="font-size: 1.4em;">For more info, click <a href="${link}">here</a>.</p>
              `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Complaints on ${issue_type} [${issue_no}]`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },

  /**
   * Mailer of complaint to admin
   * @param {{first_name:string, email:string}} user
   * @param {{issue_type, issue_no, title, description, status}} issue
   */
  complaintMessageToUser: async (user, issue) => {
    const { first_name, email } = user;
    const { issue_type, issue_no, title, description, status } = issue;

    // setup mail credentials
    let params = {};
    params.logo = Logo;
    params.header_color = "white";

    const link = `${process.env.SITE_URL}/dashboard/complaints`;

    params.body = `<p style="font-size:1.7em;"><b>Welcome to ${
      process.env.APP_NAME
    }, ${!first_name ? "user" : first_name}</b></p>`;
    params.body += `
                  <p style="font-size: 1.4em;">This is to inform you that you just made a complaint for the ticket issue ${issue_type} has been sent.</p><br/>
                  <p style="font-size: 1.4em;">Status: ${status}</p>
                  <p style="font-size: 1.4em;">Issue No: ${issue_no}</p><br/>
                  <p style="font-size: 1.4em;">Title: ${title}</p>
                  <p style="font-size: 1.4em;">Description:</p>
                  <p style="font-size: 1.2em;">${description}</p>
                  <p style="font-size: 1.4em;">For more info, click <a href="${link}">here</a>.</p>
              `;

    params.footer = "";
    params.date = new Date().getFullYear();

    let params2 = {
      email,
      subject: `Complaints on ${issue_type} [${issue_no}]`,
    };

    const template = mailer_template(params);

    // Send Mail
    Mailer(template, params2)
      .then((response) => {
        return Promise.resolve("Successful!");
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },
};
