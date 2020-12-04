import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Icon, Popup as Tooltip } from "semantic-ui-react";

export class Navigation extends Component {
  render(): JSX.Element {
    return (
      <Menu compact icon>
        <Tooltip
          content="Certificate"
          trigger={
            <Menu.Item as={NavLink} to="/certificate">
              <Icon name="info" />
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
