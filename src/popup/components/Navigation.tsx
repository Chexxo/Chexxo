import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Icon, Popup as Tooltip } from "semantic-ui-react";

/**
 * Represents the required props for the Navigation component
 */
interface Props {
  openOptionsPage: () => Promise<void>;
}

/**
 * Represents the popup window's navigation
 * @noInheritDoc
 */
export class Navigation extends Component<Props> {
  /**
   * Binds methods to the component's context
   * @param props the required props for the component
   */
  constructor(props: Props) {
    super(props);
    this.openOptionsPage = this.openOptionsPage.bind(this);
  }

  /**
   * Opens the browser extensions options page
   */
  openOptionsPage(): void {
    this.props.openOptionsPage();
  }

  /**
   * Renders the Navigation component
   * @returns the rendered Navigation component
   */
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
            <Menu.Item onClick={this.openOptionsPage}>
              <Icon name="cog" />
            </Menu.Item>
          }
        />
      </Menu>
    );
  }
}
