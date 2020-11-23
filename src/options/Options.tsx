import React, { Component } from "react";
import { Divider, Form, Label } from "semantic-ui-react";
import { Runtime } from "webextension-polyfill-ts";
import isValidUrl from "../helpers/isValidUrl";

import Configuration from "../types/Configuration";

interface Props {
  sendMessage: (
    message: { type: string; params?: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

interface State {
  isInitialRender: boolean;
  configuration: Configuration;
  isUrlValid: boolean;
  errorMessage: string;
}

export default class Options extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isInitialRender: true,
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

  async componentDidUpdate(prevProps: Props, prevState: State): Promise<void> {
    if (this.state.isInitialRender) {
      this.setState({ isInitialRender: false });
      return;
    }

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

    if (isValidUrl(newValue)) {
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

  deleteCache(): void {
    this.props.sendMessage({ type: "deleteCache" });
  }

  exportLogs(): void {
    this.props.sendMessage({ type: "exportLogs" });
  }

  render(): JSX.Element {
    return (
      <Form style={{ padding: "0.5rem" }}>
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
        <Form.Button content="Delete cache" fluid onClick={this.deleteCache} />

        <Divider horizontal>Logs</Divider>
        <Form.Button content="Export" fluid onClick={this.exportLogs} />
      </Form>
    );
  }
}
