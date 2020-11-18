import React, { Component } from "react";
import { Runtime } from "webextension-polyfill-ts";

import Configuration from "../types/Configuration";

interface Props {
  sendMessage: (
    message: { type: string; params?: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

interface State {
  configuration: Configuration;
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
    this.setState((prevState) => ({
      configuration: {
        ...prevState.configuration,
        serverUrl: newValue,
      } as Configuration,
    }));
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

  render(): JSX.Element {
    return (
      <div>
        {this.state.errorMessage && <p>this.state.errorMessage</p>}

        <label className="browser-style">
          <span>Server URL:</span>
          <input
            type="text"
            value={this.state.configuration.serverUrl}
            onChange={this.changeServerUrl}
          />
        </label>
        <br />

        <label className="browser-style">
          <span>Cache managed domains:</span>
          <input
            type="checkbox"
            checked={this.state.configuration.cacheDomainQualities}
            onChange={this.toggleCacheDomainQualities}
          />
        </label>
        <br />

        <label className="browser-style">
          <span>Cache managed domains in Incognito Mode:</span>
          <input
            type="checkbox"
            checked={this.state.configuration.cacheDomainQualitiesIncognito}
            onChange={this.toggleCacheDomainQualitiesIncognito}
          />
        </label>
        <br />
      </div>
    );
  }
}
