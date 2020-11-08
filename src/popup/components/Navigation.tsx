import React, { Component } from "react";
import { Menu, Icon, Popup as Tooltip } from "semantic-ui-react";

export default class Navigation extends Component {
  render(): JSX.Element {
    return (
      <Menu compact icon>
        <Tooltip
          content="Certificate"
          trigger={
            <Menu.Item disabled>
              <Icon name="clipboard outline" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="New Quality Entry"
          trigger={
            <Menu.Item disabled>
              <Icon name="pencil" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="Managed Domains"
          trigger={
            <Menu.Item disabled>
              <Icon name="list" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="Configuration"
          trigger={
            <Menu.Item disabled>
              <Icon name="cog" />
            </Menu.Item>
          }
        />
      </Menu>
    );
  }
}
