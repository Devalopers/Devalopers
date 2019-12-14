const nodeMailer = require('nodemailer');
const Logger = require('./logger');
/**
 * Send email.
 * @param {*} from .
 * @param {*} to .
 * @param {*} subject .
 * @param {*} htmlbody .
 * @param {*} plainbody  .
  */
function sendEmail(from, to, subject, htmlbody, plainbody) {
  const transporter = nodeMailer.createTransport({
    service: 'gmail',
    host: process.env.email_host,
    port: process.env.email_port,
    secure: true,
    auth: {
      user: process.env.email_user,
      pass: process.env.email_pass,
    },
  });
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: plainbody,
    html: htmlbody,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return Logger.logError(error);
    }
    Logger.logInfo('Message %s sent: %s', info.messageId, info.response);
  });
}

/**
 * Encode Object into URL query.
 * @param {*} data data to be encoded
 * @return {String} URL Query
  */
function encodeQueryData(data) {
  const ret = [];
  for (const d in data) {
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}


module.exports ={sendEmail, encodeQueryData};
