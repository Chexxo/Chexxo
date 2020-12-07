import React, { Component } from "react";
import { Container, Divider, Message } from "semantic-ui-react";
import { Certificate } from "../../types/certificate/Certificate";
import { PageHeader } from "../components/PageHeader";

/**
 * Represents the required props for the CertificateView component
 */
interface CertificateViewProps {
  certificate: Certificate | undefined;
}

/**
 * Represents the popup window's certificate view
 * @noInheritDoc
 */
export class CertificateView extends Component<CertificateViewProps> {
  /**
   * Renders the CertificateView component
   * @returns the rendered CertificateView component
   */
  // eslint-disable-next-line max-lines-per-function, complexity
  render(): JSX.Element {
    return (
      <Container textAlign="center">
        <div className="sticky-wrapper">
          <PageHeader title="Certificate" hasHomeButton={true} />
          <Divider section hidden />
        </div>

        {this.props.certificate ? (
          <div>
            <Divider horizontal>Subject</Divider>
            <div className="data-table">
              <div className="row">
                <div className="head">Common Name</div>
                <div className="data">
                  {this.props.certificate.subject.commonName}
                </div>
              </div>
              {this.props.certificate.subject.organization && (
                <div className="row">
                  <div className="head">Organization</div>
                  <div className="data">
                    {this.props.certificate.subject.organization}
                  </div>
                </div>
              )}
              {this.props.certificate.subject.organizationalUnit && (
                <div className="row">
                  <div className="head">Organizational Unit</div>
                  <div className="data">
                    {this.props.certificate.subject.organizationalUnit}
                  </div>
                </div>
              )}
              {this.props.certificate.subject.location && (
                <div className="row">
                  <div className="head">Location</div>
                  <div className="data">
                    {this.props.certificate.subject.location}
                  </div>
                </div>
              )}
              {this.props.certificate.subject.state && (
                <div className="row">
                  <div className="head">State</div>
                  <div className="data">
                    {this.props.certificate.subject.state}
                  </div>
                </div>
              )}
              {this.props.certificate.subject.country && (
                <div className="row">
                  <div className="head">Country</div>
                  <div className="data">
                    {this.props.certificate.subject.country}
                  </div>
                </div>
              )}
            </div>

            {this.props.certificate.subjectAltName && (
              <div>
                <Divider horizontal>Alternative Subjectnames</Divider>
                <div className="data-multi-list">
                  {this.props.certificate.subjectAltName.map((name) => {
                    return (
                      <div className="item" key={name}>
                        {name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Divider horizontal>Issuer</Divider>
            <div className="data-table">
              <div className="row">
                <div className="head">Common Name</div>
                <div className="data">
                  {this.props.certificate.issuer.commonName}
                </div>
              </div>
              {this.props.certificate.issuer.organization && (
                <div className="row">
                  <div className="head">Organization</div>
                  <div className="data">
                    {this.props.certificate.issuer.organization}
                  </div>
                </div>
              )}
              {this.props.certificate.issuer.organizationalUnit && (
                <div className="row">
                  <div className="head">Organizational Unit</div>
                  <div className="data">
                    {this.props.certificate.issuer.organizationalUnit}
                  </div>
                </div>
              )}
              {this.props.certificate.issuer.location && (
                <div className="row">
                  <div className="head">Location</div>
                  <div className="data">
                    {this.props.certificate.issuer.location}
                  </div>
                </div>
              )}
              {this.props.certificate.issuer.state && (
                <div className="row">
                  <div className="head">State</div>
                  <div className="data">
                    {this.props.certificate.issuer.state}
                  </div>
                </div>
              )}
              {this.props.certificate.issuer.country && (
                <div className="row">
                  <div className="head">Country</div>
                  <div className="data">
                    {this.props.certificate.issuer.country}
                  </div>
                </div>
              )}
            </div>

            <Divider horizontal>Fingerprints</Divider>
            <div className="data-table">
              <div className="row">
                <div className="head">SHA-1</div>
                <div className="data">{this.props.certificate.fingerprint}</div>
              </div>
              <div className="row">
                <div className="head">SHA-256</div>
                <div className="data">
                  {this.props.certificate.fingerprint256}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Message
            floating
            info
            header="Info"
            icon="info circle"
            size="tiny"
            content="No certificate found."
          />
        )}
      </Container>
    );
  }
}
