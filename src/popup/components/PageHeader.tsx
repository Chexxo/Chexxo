import React, { Component } from "react";
import { Header, Image } from "semantic-ui-react";

export default class PageHeader extends Component {
  render(): JSX.Element {
    return (
      <Header as="h2" textAlign="center">
        <Image src="../assets/logo.svg" size="tiny" /> Chexxo
      </Header>
    );
  }
}
