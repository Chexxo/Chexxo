import React, { Component } from "react";

import Configuration from "../types/Configuration";
import Configurator from "./Configurator";

interface Props {
  configurator: Configurator;
}

interface State {
  configuration: Configuration | undefined;
  errorMessage: string;
}

export default class Options extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      configuration: undefined,
      errorMessage: "",
    };
  }

  async componentDidMount(): Promise<void> {
    this.changeServerUrl = this.changeServerUrl.bind(this);

    try {
      const storageData = await this.props.configurator.getConfiguration();
      this.setState({ configuration: storageData });
    } catch (error) {
      const typedError = error as Error;
      this.setState({ errorMessage: typedError.message });
    }
  }

  componentDidUpdate(): void {
    const configuration = this.state.configuration;
    if (configuration) {
      this.props.configurator.setConfiguration(configuration);
    }
  }

  async changeServerUrl(
    event: React.FormEvent<HTMLInputElement>
  ): Promise<void> {
    const newUrl = event.currentTarget.value;
    this.setState((prevState) => ({
      configuration: {
        ...prevState.configuration,
        serverUrl: newUrl,
      },
    }));
  }

  render(): JSX.Element {
    return (
      <div>
        {this.state.errorMessage && <p>this.state.errorMessage</p>}
        <label className="browser-style" htmlFor="server-url">
          <span>Server URL:</span>
          <input
            type="text"
            value={this.state.configuration?.serverUrl}
            onChange={this.changeServerUrl}
          />
        </label>
      </div>
    );
  }
}
