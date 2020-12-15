import { Certificate } from "./certificate/Certificate";
import { ErrorMessage } from "./errors/ErrorMessage";
import { Quality } from "./Quality";

/**
 * Class respresenting the data that is stored by the
 * extension for each tab.
 */
export class TabData {
  constructor(
    public certificate?: Certificate,
    public quality?: Quality,
    public errorMessage?: ErrorMessage
  ) {}
}
