import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Button, Header, Image } from "semantic-ui-react";

interface Props {
  title: string;
  hasHomeButton: boolean;
}

export class PageHeader extends Component<Props> {
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
