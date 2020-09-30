const sslCertificate = require('get-ssl-certificate');

sslCertificate.get('nodejs.org').then(function(certificate) {
  console.log(certificate);
});