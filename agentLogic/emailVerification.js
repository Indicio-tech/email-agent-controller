const NodeMailer = require('../nodeMailer')
const SMTP = require('./settings')
const jwt = require('jsonwebtoken')
const Invitations = require('./invitations')

let EmailVerifications = require('../orm/emailVerification').emailVerification


const validate = async function (email, reCaptcha) {

  const token = jwt.sign({email: email}, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })

  var emailVerification = {
    email: email,
    token: token,
  }

  EmailVerifications.create(emailVerification)

  // SEND EMAIL
  const currentSMTP = await SMTP.getSMTP()
  const organization = await SMTP.getOrganization()

  const link = process.env.WEB_ROOT + `/emailVerification/#${token}`

  const emailVerificationText = `
  <style type="text/css">
    .tg  {border:none;border-collapse:collapse;border-spacing:0;margin:0px auto;}
    .tg td{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;overflow:hidden;
      padding:10px 5px;word-break:normal;}
    .tg th{border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:1vw;font-weight:normal;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-zv4m{border-color:#ffffff;text-align:left;vertical-align:top}
    .tg .tg-n3mx{border-color:#ffffff;color:#333333;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-b5gb{border-color:#ffffff;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-vpu8{border-color:#ffffff;font-family:Arial, Helvetica, sans-serif !important;;font-size:1vw;text-align:left;
      vertical-align:top}
    .tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
    .tg .tg-bq5v{border-color:inherit;font-size:1vw;text-align:left;vertical-align:top}
    .tg .tg-il3a{border-color:#ffffff;color:#ffffff;text-align:left;vertical-align:top}
    @media screen and (max-width: 767px) {.tg {width: auto !important;}.tg col {width: auto !important;}.tg-wrap {overflow-x: auto;-webkit-overflow-scrolling: touch;margin: auto 0px;}}
  </style>
  <div class="tg-wrap">
    <table class="tg" style="undefined;table-layout: fixed; width: 1144px">
      <colgroup>
        <col style="width: 147px">
        <col style="width: 832px">
        <col style="width: 165px">
      </colgroup>
      <tbody>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1.5vw">Welcome!<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">You've been invited to validate your email. <br><br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-il3a"></td>
          <td class="tg-n3mx" style="font-size:1vw">Please click <a href="${link}">here</a> get started.<br><br></td>
          <td class="tg-il3a"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">${link}<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb" style="font-size:1vw">This link will expire in 24 hours.<br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1vw">Thank you,<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-0pky"></td>
          <td class="tg-bq5v" style="font-size:1.5vw;font-weight:bold">${organization}<br></td>
          <td class="tg-0pky"></td>
        </tr>
        <tr>
          <td class="tg-zv4m"></td>
          <td class="tg-b5gb"><br><br></td>
          <td class="tg-zv4m"></td>
        </tr>
      </tbody>
    </table>
  </div>`

  await NodeMailer.sendMail({
    from: currentSMTP.dataValues.value.auth.user,
    to: email,
    subject: `${organization} Verify Your Email`,
    html: emailVerificationText,
  })

  return true
}

const invite = async function (token) {

  let emailVerification;

  try {
    emailVerification = await EmailVerifications.findOne({
    where: {
      token: token,
      //connection_id: null,
    }
  }); 
  } catch (e) {}

  let invitation = await Invitations.createSingleUseInvitation()

  let result = await EmailVerifications.update( {
      connection_id: invitation.connection_id
    }, {
    where: {
      id: emailVerification.id
    }
  });

  return invitation.invitation_url
}



module.exports = {
  validate,
  invite,
}