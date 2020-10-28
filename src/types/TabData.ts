import Certificate from "./CommonTypes/certificate/Certificate";
import { Quality } from "./Quality";

export default class TabData {
  constructor(
    public certificate?: Certificate,
    public quality?: Quality,
    public error?: Error
  ) {}
}
