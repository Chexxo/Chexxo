import React, { Component } from "react";
import {
  Container,
  Divider,
  Icon,
  Message,
  Popup as Tooltip,
  Rating,
  Placeholder,
} from "semantic-ui-react";

import Certificate from "../../types/certificate/Certificate";
import ErrorMessage from "../../types/errors/ErrorMessage";
import { Quality, maxQuality } from "../../types/Quality";
import Navigation from "../components/Navigation";
import PageHeader from "../components/PageHeader";

interface Props {
  errorMessage: ErrorMessage | undefined;
  certificate: Certificate | undefined;
  quality: Quality | undefined;
}
export default class Home extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className="flex-container">
        <PageHeader title="Chexxo" hasHomeButton={false} />

        <Divider section />

        {this.props.certificate && this.props.quality ? (
          <Container textAlign="center">
            <p>{this.props.certificate.subject.commonName}</p>
            <Tooltip
              content="Useful information about certificate quality"
              trigger={
                <p>
                  <span className="quality-text">
                    {this.props.quality?.text}
                  </span>
                  <Icon name="info circle" />
                </p>
              }
            />
            <p>
              <Rating
                icon="star"
                defaultRating={this.props.quality?.level}
                maxRating={maxQuality}
                size="massive"
                disabled
              />
            </p>
          </Container>
        ) : (
          !this.props.errorMessage && (
            <Placeholder>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder>
          )
        )}

        {this.props.errorMessage && (
          <Message
            floating
            negative
            header="Error"
            icon="exclamation triangle"
            size="tiny"
            content={this.props.errorMessage.message}
          />
        )}

        <Divider section />

        <Container textAlign="center">
          <Navigation />
        </Container>
      </div>
    );
  }
}
