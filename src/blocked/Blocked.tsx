import React, { Component } from "react";
import { Button, Header, Modal } from "semantic-ui-react";
import { Runtime } from "webextension-polyfill-ts";

interface Props {
  sendMessage: (
    message: { type: string; params: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

export class Blocked extends Component<Props> {
  readonly url: string;

  constructor(props: Props) {
    super(props);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.url = new URLSearchParams(window.location.search).get("url")!;
    this.acknowledgeRisk = this.acknowledgeRisk.bind(this);
  }

  async acknowledgeRisk(): Promise<void> {
    await this.props.sendMessage({
      type: "resetQuality",
      params: { url: this.url },
    });
    window.location.href = this.url;
  }

  render(): JSX.Element {
    return (
      <Modal open={true}>
        <Modal.Header>
          <img className="header-logo" src="../assets/logo.svg" /> Chexxo
        </Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Header>Certificate Quality decreased</Header>
            <p>
              The certificate quality for <strong>{this.url}</strong> was lower
              than expected, thereby further communication with this website is
              website is blocked.
            </p>
            <p>Do you want to continue using this website?</p>
          </Modal.Description>
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
