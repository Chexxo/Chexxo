import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Icon, Popup as Tooltip } from "semantic-ui-react";

interface Props {
  openOptionsPage: () => Promise<void>;
}

export class Navigation extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.openOptionsPage = this.openOptionsPage.bind(this);
  }

  openOptionsPage(): void {
    this.props.openOptionsPage();
  }

  render(): JSX.Element {
    return (
      <Menu compact icon>
        <Tooltip
          content="Certificate"
          trigger={
            <Menu.Item as={NavLink} to="/certificate">
              <Icon name="clipboard outline" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="Configuration"
          trigger={
            <Menu.Item onClick={this.openOptionsPage}>
              <Icon name="cog" />
            </Menu.Item>
          }
        />
      </Menu>
    );
  }
}
