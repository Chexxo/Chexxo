import React, { Component } from "react";
import { Button, Header, Modal } from "semantic-ui-react";
import { Runtime } from "webextension-polyfill-ts";

/**
 * Represents the required props for the Blocked component
 */
interface Props {
  sendMessage: (
    message: { type: string; params: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

/**
 * Represents the error page for blocked websites
 * @noInheritDoc
 */
export class Blocked extends Component<Props> {
  readonly url: string;

  /**
   * Queries the current location's url and bind methods to the components context
   * @param props the required props for the component
   */
  constructor(props: Props) {
    super(props);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.url = new URLSearchParams(window.location.search).get("url")!;
    this.acknowledgeRisk = this.acknowledgeRisk.bind(this);
  }

  /**
   * Sends a message for resetting the current urls quality to the background script
   */
  public async acknowledgeRisk(): Promise<void> {
    await this.props.sendMessage({
      type: "resetQuality",
      params: { url: this.url },
    });
    window.location.href = this.url;
  }

  /**
   * Renders the Blocked component
   * @returns the rendered Blocked component
   */
  render(): JSX.Element {
    return (
      <Modal open={true}>
        <Modal.Header>
          <img className="header-logo" src="../assets/logo.svg" /> Chexxo
        </Modal.Header>
        <Modal.Content>
          <Header>Certificate Quality decreased</Header>
          <p style={{ wordWrap: "break-word" }}>
            The certificate quality for <strong>{this.url}</strong> was lower
            than expected, therefore further communication with this website is
            blocked.
          </p>
          <p>Do you want to continue using this website?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="I understand the risk and want to continue using this site"
            icon="exclamation triangle"
            onClick={this.acknowledgeRisk}
            negative
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
