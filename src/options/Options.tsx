import React, { Component } from "react";

import { Storage } from "webextension-polyfill-ts";

interface Props {
  storage: Storage.StorageArea;
}

interface State {
  serverUrl: string;
}

export default class Options extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      serverUrl: "",
    };
  }

  async componentDidMount(): Promise<void> {
    this.changeServerUrl = this.changeServerUrl.bind(this);
    const storageData = (await this.readFromStorage(["serverUrl"])) as State;
    this.setState(storageData);
  }

  async writeToStorage(keys: Record<string, unknown>): Promise<void> {
    try {
      await this.props.storage.set(keys);
    } catch (error) {
      console.log(error);
    }
  }

  async readFromStorage(keys: string[]): Promise<unknown> {
    try {
      return await this.props.storage.get(keys);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  changeServerUrl(event: React.FormEvent<HTMLInputElement>): void {
    const newValue = event.currentTarget.value;
    this.setState({ serverUrl: newValue });
    this.writeToStorage({ serverUrl: newValue });
  }

  render(): JSX.Element {
    return (
      <div>
        <label className="browser-style" htmlFor="server-url">
          <span>Server URL:</span>
          <input
            type="text"
            value={this.state.serverUrl}
            onBlur={this.changeServerUrl}
          />
        </label>
      </div>
    );
  }
}
