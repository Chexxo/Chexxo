import { WebRequest } from "webextension-polyfill-ts";
import { RawCertificate } from "../../../../shared/types/certificate/RawCertificate";
import { CertificateProvider } from "../CertificateProvider";

export class MockCertificateProvider implements CertificateProvider {
  async getCertificate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<RawCertificate> {
    return new RawCertificate(
      "MIIEyDCCA7CgAwIBAgIRALL+P2asRHyfAgAAAAB9mgMwDQYJKoZIhvcNAQELBQAw" +
        "QjELMAkGA1UEBhMCVVMxHjAcBgNVBAoTFUdvb2dsZSBUcnVzdCBTZXJ2aWNlczET" +
        "MBEGA1UEAxMKR1RTIENBIDFPMTAeFw0yMDEwMDYwNjQxMjBaFw0yMDEyMjkwNjQx" +
        "MjBaMGgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH" +
        "Ew1Nb3VudGFpbiBWaWV3MRMwEQYDVQQKEwpHb29nbGUgTExDMRcwFQYDVQQDEw53" +
        "d3cuZ29vZ2xlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGp8Sp01kEsr" +
        "Gz98cyb/Kt+xvLJzsqGgIAOXjdHfjOzOUJTiMJIB/NIpQnDvNZ9L3qF3Zl2ecyFY" +
        "ZoI5LMyTrImjggJcMIICWDAOBgNVHQ8BAf8EBAMCB4AwEwYDVR0lBAwwCgYIKwYB" +
        "BQUHAwEwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUXXztHYUOkjN796BgKuPdcGaL" +
        "iVswHwYDVR0jBBgwFoAUmNH4bhDrz5vsYJ8YkBug630J/SswaAYIKwYBBQUHAQEE" +
        "XDBaMCsGCCsGAQUFBzABhh9odHRwOi8vb2NzcC5wa2kuZ29vZy9ndHMxbzFjb3Jl" +
        "MCsGCCsGAQUFBzAChh9odHRwOi8vcGtpLmdvb2cvZ3NyMi9HVFMxTzEuY3J0MBkG" +
        "A1UdEQQSMBCCDnd3dy5nb29nbGUuY29tMCEGA1UdIAQaMBgwCAYGZ4EMAQICMAwG" +
        "CisGAQQB1nkCBQMwMwYDVR0fBCwwKjAooCagJIYiaHR0cDovL2NybC5wa2kuZ29v" +
        "Zy9HVFMxTzFjb3JlLmNybDCCAQQGCisGAQQB1nkCBAIEgfUEgfIA8AB2ALIeBcyL" +
        "os2KIE6HZvkruYolIGdr2vpw57JJUy3vi5BeAAABdPzbivQAAAQDAEcwRQIgdhDC" +
        "6bAIuOvy8noeZWMbiudTQpTGD1Wkx4yeSSf1aiMCIQC2HHLZRGjNa043bqXSunpm" +
        "BadlxXX2pTa4GaLYAxvk9wB2AOcS8rA3fhpi+47JDGGE8ep7N8tWHREmW/Pg80vy" +
        "QVRuAAABdPzbivcAAAQDAEcwRQIgSq5jcykP0BrVPo/51u9PIdC63A5l/vFcUsj2" +
        "r5Ro4S8CIQDHff9rJmMTsXLviBW+/zAy1gWBKbqqdnNh/pXixUGtgTANBgkqhkiG" +
        "9w0BAQsFAAOCAQEAZXv8x/2Z/+1vAyuwVtx3Euw+pDfPF3UNuFJ64NzdYw8+xLK5" +
        "W31ILMOpQII1ERfkU2IxmoQlVpVBYNNMkBnMPNMSBzzlQNAxxL8Ze5JKE5sOkb/8" +
        "FoqAwWQYNERcUJ1u3y2viiR7chBLGElo7yXMJgx1so9HD8NVR3rEA9oScBVW5udV" +
        "Cjg0b0RCOKFU8e+xoaKX7/OeNddrwoVZnRmwvUddbx2rqU8TZdvJMAQaecot8bty" +
        "TVPk+4gxuNxIZSLufY7uDh/qZYNSc2/pSfyyM8CKO54Uq8VqVVb5tGmSXLWRbtBY" +
        "pM8zLEwTp1yoOFB3P5GCrZX63/USA8COaE32Ow=="
    );
  }
}
