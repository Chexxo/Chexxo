import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Button, Header, Image } from "semantic-ui-react";

/**
 * Represents the required props for the Popup component
 */
interface PageHeaderProps {
  title: string;
  hasHomeButton: boolean;
}

/**
 * Represents the popup window's page header
 * @noInheritDoc
 */
export class PageHeader extends Component<PageHeaderProps> {
  /**
   * Renders the PageHeader component
   * @returns the rendered PageHeader component
   */
  render(): JSX.Element {
    return (
      <div className="header-container">
        {this.props.hasHomeButton && (
          <Button
            className="header-button"
            icon="arrow left"
            as={NavLink}
            to="/"
          />
        )}
        <Header as="h2" textAlign="center">
          <Image src="../assets/logo.svg" size="tiny" />
          {this.props.title}
        </Header>
      </div>
    );
  }
}
