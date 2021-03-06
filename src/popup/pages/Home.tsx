import React, { Component } from "react";
import {
  Container,
  Divider,
  Icon,
  Message,
  Popup as Tooltip,
  Rating,
} from "semantic-ui-react";

import { Certificate } from "../../types/certificate/Certificate";
import { ErrorMessage } from "../../types/errors/ErrorMessage";
import { Quality, maxQuality } from "../../types/Quality";
import { Navigation } from "../components/Navigation";
import { PageHeader } from "../components/PageHeader";

/**
 * Represents the required props for the Home component
 */
interface HomeProps {
  errorMessage: ErrorMessage | undefined;
  certificate: Certificate | undefined;
  quality: Quality | undefined;
  openOptionsPage: () => Promise<void>;
}

/**
 * Represents the popup window's home view
 * @noInheritDoc
 */
export class Home extends Component<HomeProps> {
  /**
   * Renders the Home component
   * @returns the rendered Home component
   */
  // eslint-disable-next-line max-lines-per-function
  render(): JSX.Element {
    return (
      <Container textAlign="center">
        <div className="sticky-wrapper">
          <PageHeader title="Chexxo" hasHomeButton={false} />
          <Divider section />
        </div>

        {this.props.certificate && this.props.quality ? (
          <div className="quality-wrapper">
            <h4>{this.props.certificate.subject.commonName}</h4>

            <Tooltip
              content={this.props.quality.info}
              position="bottom center"
              trigger={
                <h3>
                  <span className="quality-text">
                    {this.props.quality?.text}
                  </span>
                  <Icon name="question circle" />
                </h3>
              }
            />

            <Rating
              icon="star"
              defaultRating={this.props.quality?.level}
              maxRating={maxQuality}
              size="massive"
              disabled
            />
          </div>
        ) : (
          !this.props.errorMessage && (
            <Message
              floating
              info
              header="Info"
              icon="info circle"
              size="tiny"
              content="Please load a page to evaluate certificate quality."
            />
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
        <Navigation openOptionsPage={this.props.openOptionsPage} />
      </Container>
    );
  }
}
