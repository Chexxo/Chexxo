import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Icon, Popup as Tooltip } from "semantic-ui-react";

export default class Navigation extends Component {
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
          content="New Quality Entry"
          trigger={
            <Menu.Item as={NavLink} to="/new-quality">
              <Icon name="pencil" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="Managed Domains"
          trigger={
            <Menu.Item as={NavLink} to="/domains">
              <Icon name="list" />
            </Menu.Item>
          }
        />
        <Tooltip
          content="Configuration"
          trigger={
            <Menu.Item as={NavLink} to="/configuration">
              <Icon name="cog" />
            </Menu.Item>
          }
        />
      </Menu>
    );
  }
}
