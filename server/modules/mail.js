var nodemailer = require('nodemailer');

module.exports.enviarMail= function(to, body, subject){
  return new Promise (function (resolve, reject) {
    var transporter = nodemailer.createTransport({
      host: 'smtp.gabssa.com.mx',
      port: 587,
      secure: false,
      ignoreTLS: true,
      auth: {
       user: 'blue@gabssa.com.mx',
       pass: 'BLUE12457'
      }
    });

    var message = {
          from: '"Notificaciones Sistema GABSSA BLUE"<blue@gabssa.com.mx>',
          to: to,
          subject: subject,
          html: body
      };

      transporter.sendMail(message, function(err) {
        if (!err) {
          console.log('Email enviado');
        } else
          console.log(err);
        resolve();
      });
  });
}
