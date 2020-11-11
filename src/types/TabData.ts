import Certificate from "./certificate/Certificate";
import ErrorMessage from "./errors/ErrorMessage";
import { Quality } from "./Quality";

export default class TabData {
  constructor(
    public certificate?: Certificate,
    public quality?: Quality,
    public errorMessage?: ErrorMessage
  ) {}
}
