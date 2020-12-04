import React, { Component } from "react";
import { Divider, Form, Label } from "semantic-ui-react";
import { Runtime } from "webextension-polyfill-ts";
import { LogFactory } from "../shared/logger/LogFactory";
import { LogEntry } from "../shared/types/logger/LogEntry";

import { Configuration } from "../types/Configuration";

interface Props {
  sendMessage: (
    message: { type: string; params?: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
  hasServer: boolean;
}

interface State {
  configuration: Configuration;
  isUrlValid: boolean;
  errorMessage: string;
}

export default class Options extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      configuration: {
        serverUrl: "",
        cacheDomainQualities: false,
        cacheDomainQualitiesIncognito: false,
      },
      isUrlValid: true,
      errorMessage: "",
    };
  }

  async componentDidMount(): Promise<void> {
    this.changeServerUrl = this.changeServerUrl.bind(this);
    this.toggleCacheDomainQualities = this.toggleCacheDomainQualities.bind(
      this
    );
    this.toggleCacheDomainQualitiesIncognito = this.toggleCacheDomainQualitiesIncognito.bind(
      this
    );
    this.removeCache = this.removeCache.bind(this);
    this.exportLogs = this.exportLogs.bind(this);
    this.removeLogs = this.removeLogs.bind(this);

    try {
      const configuration = (await this.props.sendMessage({
        type: "getConfiguration",
      })) as Configuration;
      this.setState({ configuration });
    } catch (error) {
      const typedError = error as Error;
      this.setState({ errorMessage: typedError.message });
    }
  }

  async componentDidUpdate(): Promise<void> {
    try {
      const configuration = this.state.configuration;
      await this.props.sendMessage({
        type: "setConfiguration",
        params: { configuration },
      });
    } catch (error) {
      const typedError = error as Error;
      this.setState({ errorMessage: typedError.message });
    }
  }

  changeServerUrl(event: React.FormEvent<HTMLInputElement>): void {
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

  toggleCacheDomainQualities(): void {
    const newValue = !this.state.configuration.cacheDomainQualities;
    this.setState((prevState) => ({
      configuration: {
        ...prevState.configuration,
        cacheDomainQualities: newValue,
      } as Configuration,
    }));
  }

  toggleCacheDomainQualitiesIncognito(): void {
    const newValue = !this.state.configuration.cacheDomainQualitiesIncognito;
    this.setState((prevState) => ({
      configuration: {
        ...prevState.configuration,
        cacheDomainQualitiesIncognito: newValue,
      } as Configuration,
    }));
  }

  removeCache(): void {
    this.props.sendMessage({ type: "removeCache" });
  }

  public async exportLogs(): Promise<void> {
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
  }

  public async removeLogs(): Promise<void> {
    await this.props.sendMessage({ type: "removeLogs" });
  }

  private isValidUrl(url: string): boolean {
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (_) {
      return false;
    }

    return validUrl.protocol === "http:" || validUrl.protocol === "https";
  }

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
          label="Cache domain qualities and compare them on the next visit"
          checked={this.state.configuration.cacheDomainQualities}
          onChange={this.toggleCacheDomainQualities}
        />
        <Form.Checkbox
          toggle
          label="Cache domain qualities in Icognito Mode"
          checked={this.state.configuration.cacheDomainQualitiesIncognito}
          onChange={this.toggleCacheDomainQualitiesIncognito}
        />
        <Form.Button content="Delete cache" fluid onClick={this.removeCache} />

        <Divider horizontal>Logs</Divider>
        <Form.Button content="Export" fluid onClick={this.exportLogs} />
        <Form.Button content="Remove" fluid onClick={this.removeLogs} />
      </Form>
    );
  }
}
