import React, { Component } from "react";
import {
  Container,
  Divider,
  Header,
  Icon,
  Message,
  Popup as Tooltip,
  Rating,
  Image,
} from "semantic-ui-react";

import "../../assets/logo.svg";
import Certificate from "../../types/CommonTypes/certificate/Certificate";
import ErrorMessage from "../../types/errors/ErrorMessage";
import { Quality } from "../../types/Quality";
import Navigation from "../components/Navigation";

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
        <Header as="h2" content="Chexxo" textAlign="center">
          <Image src="../../assets/logo.svg" size="tiny" /> Chexxo
        </Header>

        <Divider section />

        <Container textAlign="center">
          {this.props.certificate ? (
            <p>{this.props.certificate.subject.commonName}</p>
          ) : (
            ""
          )}

          {this.props.quality ? (
            <div>
              <p>
                <Tooltip
                  content="Useful information about certificate quality"
                  trigger={
                    <div>
                      <span className="quality-text">
                        {this.props.quality?.text}
                      </span>
                      <Icon name="info circle" />
                    </div>
                  }
                />
              </p>
              <p>
                <Rating
                  icon="star"
                  defaultRating={this.props.quality?.level}
                  maxRating={3}
                  size="massive"
                  disabled
                />
              </p>
            </div>
          ) : (
            ""
          )}
        </Container>

        {this.props.errorMessage ? (
          <Message
            floating
            negative
            header="Error"
            icon="exclamation triangle"
            size="tiny"
            content={this.props.errorMessage.message}
          />
        ) : (
          ""
        )}

        <Divider section />

        <Container textAlign="center">
          <Navigation />
        </Container>
      </div>
    );
  }
}
