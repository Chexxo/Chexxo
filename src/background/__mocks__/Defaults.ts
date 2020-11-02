import { WebRequest } from "webextension-polyfill-ts";
import Certificate from "../../types/CommonTypes/certificate/Certificate";
import Issuer from "../../types/CommonTypes/certificate/Issuer";
import Subject from "../../types/CommonTypes/certificate/Subject";

export const requestId = "1";

export const onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType = {
  requestId,
  url: "https://example.com/",
  method: "GET",
  frameId: 0,
  parentFrameId: -1,
  tabId: 1,
  type: "main_frame",
  timeStamp: 0,
  statusLine: "HTTP/2.0 200 OK",
  statusCode: 200,
  thirdParty: false,
};

export const getSecurityInfoOptions: WebRequest.GetSecurityInfoOptionsType = {
  certificateChain: false,
  rawDER: false,
};

export const securityInfo: WebRequest.SecurityInfo = {
  state: "secure",
  certificates: [
    {
      subject: "",
      issuer: "",
      validity: { start: 0, end: 0 },
      fingerprint: { sha1: "", sha256: "" },
      serialNumber: "",
      isBuiltInRoot: false,
      subjectPublicKeyInfoDigest: { sha256: "" },
    },
  ],
};

export const certificate = new Certificate(
  "",
  "",
  new Issuer("", "", "", "", "", ""),
  0,
  new Subject("", "", "", "", "", ""),
  [],
  0,
  0,
  false
);
