import { RawCertificate } from "../../../shared/types/certificate/RawCertificate";
import { CertificateParser } from "./CertificateParser";

test("prettifies hex strings", () => {
  const result = CertificateParser["prettifyHex"]("ab1f2ac34b6c8e");
  expect(result).toBe("AB:1F:2A:C3:4B:6C:8E");
});

test("gets timestamp from utc time before 2000", () => {
  const result = CertificateParser["getTimestampFromUTCTime"]("991231235930Z");
  expect(result).toBe(946684770); //31.12.1999 11:59:30
});

test("gets timestamp from utc time after 2000", () => {
  const result = CertificateParser["getTimestampFromUTCTime"]("101231235930Z");
  expect(result).toBe(1293839970); //31.12.2010 11:59:30
});

test("returns distinguished name from string", () => {
  const result = CertificateParser["DistinguishedNameFromString"](
    "CN=My User/O=My Org/OU=Unit/C=AU/L=My Town"
  );
  expect(result.commonName).toBe("My User");
});

test("returns distinguished name from string with empties", () => {
  const result = CertificateParser["DistinguishedNameFromString"]("CN=My User");
  expect(result.commonName).toBe("My User");
});

test("returns distinguished name from string with other empties", () => {
  const result = CertificateParser["DistinguishedNameFromString"]("O=My Org");
  expect(result.organization).toBe("My Org");
});

// eslint-disable-next-line max-lines-per-function
test("converts rawCert to certificate", () => {
  const raw = new RawCertificate(
    "-----BEGIN CERTIFICATE-----" +
      "MIIH/jCCBuagAwIBAgIQAX8bmVzqTyLWDtp3I99OuDANBgkqhkiG9w0BAQsFADB1" +
      "MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3" +
      "d3cuZGlnaWNlcnQuY29tMTQwMgYDVQQDEytEaWdpQ2VydCBTSEEyIEV4dGVuZGVk" +
      "IFZhbGlkYXRpb24gU2VydmVyIENBMB4XDTE5MDgyNzAwMDAwMFoXDTIxMDgzMTEy" +
      "MDAwMFowgcoxHTAbBgNVBA8MFFByaXZhdGUgT3JnYW5pemF0aW9uMRMwEQYLKwYB" +
      "BAGCNzwCAQMTAlVTMRUwEwYLKwYBBAGCNzwCAQITBFV0YWgxFTATBgNVBAUTDDUy" +
      "OTk1MzctMDE0MjELMAkGA1UEBhMCVVMxDTALBgNVBAgTBFV0YWgxDTALBgNVBAcT" +
      "BExlaGkxFzAVBgNVBAoTDkRpZ2lDZXJ0LCBJbmMuMQswCQYDVQQLEwJJVDEVMBMG" +
      "A1UEAxMMZGlnaWNlcnQuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC" +
      "AQEAt7719pINNI2eKb67daOM/FLVFTYYKXvk+6r2jsKZfmKVehJOSnla5ndbVqEY" +
      "HpT0cmW2G6t7lFBTX4M61RtjzOm1ACTUtqTAvJYghhGAL28sZKcjap0NcHcI0lvV" +
      "tApQtRQbjtwYpHzwouIAQ332dVfuKZFqG/IufgA5CrQhASVFAVCS+K667qsGbvoZ" +
      "hfHmahMGygotyziTWgSCY4LdpHuDlGbZ/aA9rs/2KLucatfn8rhmof1QAnPeHKYz" +
      "IGADbmNec6L5hgnsWRUtGy9ok8JauyO/aSpSzN494yjuSvMP5Fhcfi0IXlyehiOc" +
      "i830ayZbNjSo4PXfb2YZDw2b1wIDAQABo4IEMjCCBC4wHwYDVR0jBBgwFoAUPdNQ" +
      "pdagre7zSmAKZdMh1Pj41g8wHQYDVR0OBBYEFJhyP7WBMlsybL1stpU9q32tuXHY" +
      "MIHdBgNVHREEgdUwgdKCEHd3dy5kaWdpY2VydC5jb22CEmFkbWluLmRpZ2ljZXJ0" +
      "LmNvbYIMZGlnaWNlcnQuY29tghRjb250ZW50LmRpZ2ljZXJ0LmNvbYISbG9naW4u" +
      "ZGlnaWNlcnQuY29tghBhcGkuZGlnaWNlcnQuY29tgg93cy5kaWdpY2VydC5jb22C" +
      "F3d3dy5vcmlnaW4uZGlnaWNlcnQuY29tghh3ZWJzZWN1cml0eS5kaWdpY2VydC5j" +
      "b22CHHd3dy53ZWJzZWN1cml0eS5kaWdpY2VydC5jb20wDgYDVR0PAQH/BAQDAgWg" +
      "MB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjB1BgNVHR8EbjBsMDSgMqAw" +
      "hi5odHRwOi8vY3JsMy5kaWdpY2VydC5jb20vc2hhMi1ldi1zZXJ2ZXItZzIuY3Js" +
      "MDSgMqAwhi5odHRwOi8vY3JsNC5kaWdpY2VydC5jb20vc2hhMi1ldi1zZXJ2ZXIt" +
      "ZzIuY3JsMEsGA1UdIAREMEIwNwYJYIZIAYb9bAIBMCowKAYIKwYBBQUHAgEWHGh0" +
      "dHBzOi8vd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwBwYFZ4EMAQEwgYgGCCsGAQUFBwEB" +
      "BHwwejAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNlcnQuY29tMFIGCCsG" +
      "AQUFBzAChkZodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20vRGlnaUNlcnRTSEEy" +
      "RXh0ZW5kZWRWYWxpZGF0aW9uU2VydmVyQ0EuY3J0MAwGA1UdEwEB/wQCMAAwggF+" +
      "BgorBgEEAdZ5AgQCBIIBbgSCAWoBaAB2AO5Lvbd1zmC64UJpH6vhnmajD35fsHLY" +
      "gwDEe4l6qP3LAAABbNQ9a8QAAAQDAEcwRQIgTIXKci6HCaZk7NYEooAlDaLfGAxb" +
      "dukycehq9w4c6nYCIQD/8rVLAKHfJN9wbFz/6uuwa58AmFrwBfvAqX2kwnSuogB3" +
      "AFYUBpov18Ls0/XhvUSyPsdGdrm8mRFcwO+UmFXWidDdAAABbNQ9bAUAAAQDAEgw" +
      "RgIhAJHahDzpq6TKKgzH/i7rWnJW/VKa1ZXFSkqUDNc1D/M8AiEAs/gH6ChoroP3" +
      "MqIbZuGJ7X38ARgltFxa4xcbBDiEonoAdQC72d+8H4pxtZOUI5eqkntHOFeVCqtS" +
      "6BqQlmQ2jh7RhQAAAWzUPWu8AAAEAwBGMEQCIACJTt35lyTYofRId8ZO9gc2lHoK" +
      "JWzFFt6XDUSJs+9VAiBo+GpInZqz+wBnmm2eWXyU9vNK8WkxlbUP6fizTdiu9jAN" +
      "BgkqhkiG9w0BAQsFAAOCAQEAYnk2KBFU/AWAmQlVqxtFiLOzrs1O+ulMp3hJx60g" +
      "5qcPMqOFWx24kWfeaGsZq3ysyn0vfAWy/zjG+Mvlk1GD+ZjirFJxAM4QiGpBwfDf" +
      "U3FZRVtwP343RDpzkelZKE/bP5Ayvxe4Lu0DTmi+wuxO/HJC6h6qlQflaXPKgejE" +
      "Z+QjL11jKXjYLYO4ijPHY2qJm+Ey4Ij0ORDVcbRDAOHZWKEp69erOV6U8J6l/Hjs" +
      "C6eY77o+jpBqoJ2B766WcB1YjdakFU4ffoTH9lPakRnR677z4B+J9G+Z+WApU3ZR" +
      "8j/Z/XV3n1HwhsExgyN3hNKDisaHPzgr8rhpgeFEzZd7pQ==" +
      "-----END CERTIFICATE-----"
  );
  const result = CertificateParser.getCertificate(raw);
  expect(result.subject.commonName).toBe("digicert.com");
});

test("converts rawCert without policies and altnames to certificate", () => {
  const raw = new RawCertificate(
    "-----BEGIN CERTIFICATE-----" +
      "MIICZjCCAc+gAwIBAgIUXZbL01c2twhJPaE1saXiI5+W+7kwDQYJKoZIhvcNAQEL" +
      "BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM" +
      "GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMDEyMDcxMDQ1NDFaFw0yMTEy" +
      "MDcxMDQ1NDFaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw" +
      "HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwgZ8wDQYJKoZIhvcNAQEB" +
      "BQADgY0AMIGJAoGBAK28KMh5TsuBAhaE5DIx4CJyy6fIGKmUcWoKrfbYfpIiRqqb" +
      "SACZhPxlaaRQ07yeq+zmExeNd9B5MZsSkpsLXLun7h3yAnJDfUnoVF5xcv0l3MgZ" +
      "IzV16Y8oCwN1xmPUQd73aFJUTx5KRQVSm3J6QhWogvbZZdU2Cviv3HWg4AY/AgMB" +
      "AAGjUzBRMB0GA1UdDgQWBBQdzaKaHgdtzl1r6zphw93X4daQ8jAfBgNVHSMEGDAW" +
      "gBQdzaKaHgdtzl1r6zphw93X4daQ8jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3" +
      "DQEBCwUAA4GBAHk2ouRfG5TRFAdxCJMFC7+rVt24he0tUXoA9z/Y4c/p8Y8qMyWI" +
      "/H+LVocI5fHTuqpuxKptPR5O72HUu250CIY32BpnvjGd+vNF4SVALFmekaZk4rqf" +
      "BTpc3riIHmEiO5bD/3XRgTDzvu/mbmNT4RKiJZzw7O7zOhgZo/5sF5Zl" +
      "-----END CERTIFICATE-----"
  );
  const result = CertificateParser.getCertificate(raw);
  expect(result.subject.commonName).toBe("");
});
