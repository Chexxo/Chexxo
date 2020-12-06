import React, { Component } from "react";
import { Divider, Form, Label, Message } from "semantic-ui-react";
import { Runtime } from "webextension-polyfill-ts";
import { LogFactory } from "../shared/logger/LogFactory";
import { LogEntry } from "../shared/types/logger/LogEntry";

import { Configuration } from "../types/Configuration";

/**
 * Represents the different message status for the Options component
 */
enum MessageStatus {
  NONE,
  FAILURE,
  SUCCESS,
}

/**
 * Represents the required props for the Options component
 */
interface Props {
  sendMessage: (
    message: { type: string; params?: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
  hasServer: boolean;
}

/**
 * Represents the state object for the Options component
 */
interface State {
  configuration: Configuration;
  isUrlValid: boolean;
  messageStatus: MessageStatus;
  messageHeader: string;
  messageBody: string;
  messageTimeoutId: number;
}

/**
 * Represents the options page
 * @noInheritDoc
 */
export class Options extends Component<Props, State> {
  /**
   * Initializes the component's default state
   * @param props the required props for the component
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      configuration: {
        serverUrl: "",
        cacheDomainQualities: false,
      },
      isUrlValid: true,
      messageStatus: MessageStatus.NONE,
      messageHeader: "",
      messageBody: "",
      messageTimeoutId: 0,
    };
  }

  /**
   * Binds methods to the component's context and queries the current configuration
   */
  async componentDidMount(): Promise<void> {
    this.changeServerUrl = this.changeServerUrl.bind(this);
    this.toggleCacheDomainQualities = this.toggleCacheDomainQualities.bind(
      this
    );
    this.removeCache = this.removeCache.bind(this);
    this.exportLogs = this.exportLogs.bind(this);
    this.removeLogs = this.removeLogs.bind(this);
    this.generateMessage = this.generateMessage.bind(this);

    try {
      const configuration = (await this.props.sendMessage({
        type: "getConfiguration",
      })) as Configuration;
      this.setState({ configuration });
    } catch (error) {
      const typedError = error as Error;
      this.generateMessage(
        MessageStatus.FAILURE,
        "Could not get current configuration",
        typedError.message
      );
    }
  }

  /**
   * Synchronizes the state's configuration with the stored configuration on update
   */
  async componentDidUpdate(): Promise<void> {
    try {
      const configuration = this.state.configuration;
      await this.props.sendMessage({
        type: "setConfiguration",
        params: { configuration },
      });
    } catch (error) {
      const typedError = error as Error;
      this.generateMessage(
        MessageStatus.FAILURE,
        "Could not persist current configuration",
        typedError.message
      );
    }
  }

  /**
   * Changes the state's server url
   * @param event form input change event
   */
  public changeServerUrl(event: React.FormEvent<HTMLInputElement>): void {
    const newValue = event.currentTarget.value;

    if (this.isValidUrl(newValue) || newValue === "") {
      this.setState((prevState) => ({
        configuration: {
          ...prevState.configuration,
          serverUrl: newValue,
        } as Configuration,
        isUrlValid: true,
      }));
    } else {
      this.setState({ isUrlValid: false });
    }
  }

  /**
   * Toggles the cacheDomainQualities property in the component's state
   */
  public toggleCacheDomainQualities(): void {
    const newValue = !this.state.configuration.cacheDomainQualities;
    this.setState((prevState) => ({
      configuration: {
        ...prevState.configuration,
        cacheDomainQualities: newValue,
      } as Configuration,
    }));
  }

  /**
   * Sends a message for removing the stored cache to the background script
   */
  public removeCache(): void {
    this.props.sendMessage({ type: "removeCache" });
    this.generateMessage(
      MessageStatus.SUCCESS,
      "Cache removed",
      "Your domain-cache has been removed successfully."
    );
  }

  /**
   * Queries the current logs and exports them to the GUI
   */
  public async exportLogs(): Promise<void> {
    try {
      const logEntries = (await this.props.sendMessage({
        type: "exportLogs",
      })) as LogEntry[];
      const element = document.createElement("a");

      let file;
      if (logEntries === null) {
        file = new Blob([], { type: "text/plain;charset=utf-8" });
      } else {
        let fileExport = "";
        for (let i = 0; i < logEntries.length; i++) {
          fileExport += LogFactory.formatLogEntry(logEntries[i]) + "\n";
          file = new Blob([fileExport], { type: "text/plain;charset=utf-8" });
        }
      }
      element.href = URL.createObjectURL(file);
      element.download = `ChexxoLog_${Math.floor(Date.now() / 1000)}.txt`;
      document.body.appendChild(element);
      element.click();
      this.generateMessage(
        MessageStatus.SUCCESS,
        "Log exported",
        "The log has been exported successfully."
      );
    } catch (error) {
      const typedError = error as Error;
      this.generateMessage(
        MessageStatus.FAILURE,
        "Log could not be exported",
        typedError.message
      );
    }
  }

  /**
   * Sends a message for removing the stored logs to the background script
   */
  public async removeLogs(): Promise<void> {
    try {
      await this.props.sendMessage({ type: "removeLogs" });
      this.generateMessage(
        MessageStatus.SUCCESS,
        "Log removed",
        "The log has been removed successfully."
      );
    } catch (error) {
      const typedError = error as Error;
      this.generateMessage(
        MessageStatus.SUCCESS,
        "Log could not be removed",
        typedError.message
      );
    }
  }

  /**
   * Checks if the parameter is a valid http/https url
   * @param url The url which needs to be checked
   * @returns True if it is a valid url, false if not
   */
  private isValidUrl(url: string): boolean {
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (_) {
      return false;
    }

    return validUrl.protocol === "http:" || validUrl.protocol === "https:";
  }

  /**
   * Updates the state with a new message
   * @param status The message's status
   * @param header The message's header text
   * @param body The message's body text
   */
  private generateMessage(
    status: MessageStatus,
    header: string,
    body: string
  ): void {
    this.setState({
      messageStatus: status,
      messageHeader: header,
      messageBody: body,
    });
  }

  /**
   * Renders the Options component
   * @returns the rendered Options component
   */
  render(): JSX.Element {
    return (
      <Form style={{ padding: "0.5rem" }}>
        {this.props.hasServer && (
          <div>
            <Divider horizontal>Server</Divider>
            <Form.Field error={!this.state.isUrlValid}>
              <input
                type="text"
                placeholder="http://localhost:3000"
                defaultValue={this.state.configuration.serverUrl}
                onBlur={this.changeServerUrl}
              />
              {!this.state.isUrlValid && (
                <Label basic color="red" pointing>
                  URL is not valid
                </Label>
              )}
            </Form.Field>
          </div>
        )}

        <Divider horizontal>Domains</Divider>
        <Form.Checkbox
          toggle
          label="Cache domain qualities to block future website access, should the quality decrease."
          checked={this.state.configuration.cacheDomainQualities}
          onChange={this.toggleCacheDomainQualities}
        />
        <Form.Button content="Remove cache" fluid onClick={this.removeCache} />

        <Divider horizontal>Logs</Divider>
        <Form.Button content="Export" fluid onClick={this.exportLogs} />
        <Form.Button content="Remove" fluid onClick={this.removeLogs} />
        {this.state.messageStatus === MessageStatus.SUCCESS && (
          <Message positive>
            <Message.Header>{this.state.messageHeader}</Message.Header>
            <p>{this.state.messageBody}</p>
          </Message>
        )}
        {this.state.messageStatus === MessageStatus.FAILURE && (
          <Message negative>
            <Message.Header>{this.state.messageHeader}</Message.Header>
            <p>{this.state.messageBody}</p>
          </Message>
        )}
      </Form>
    );
  }
}
