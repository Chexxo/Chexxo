import React, { Component } from "react";
import { Divider, Message } from "semantic-ui-react";
import Certificate from "../../types/certificate/Certificate";
import PageHeader from "../components/PageHeader";

interface Props {
  certificate: Certificate | undefined;
}

export default class CertificateView extends Component<Props> {
  render(): JSX.Element {
    return (
      <div className="container">
        <PageHeader />

        <Divider section hidden />

        {this.props.certificate ? (
          <div>
            <Divider horizontal>Fingerprints</Divider>
            <table className="data-view">
              <tbody>
                <tr>
                  <th>SHA-1</th>
                  <td>
                    <div className="word-wrap">
                      {this.props.certificate.fingerprint}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>SHA-256</th>
                  <td>
                    <div className="word-wrap">
                      {this.props.certificate.fingerprint256}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <Divider horizontal>Subject</Divider>
            <table className="data-view">
              <tbody>
                <tr>
                  <th>Common Name</th>
                  <td>{this.props.certificate.subject.commonName}</td>
                </tr>
                {this.props.certificate.subject.organization && (
                  <tr>
                    <th>Organization</th>
                    <td>{this.props.certificate.subject.organization}</td>
                  </tr>
                )}
                {this.props.certificate.subject.organizationalUnit && (
                  <tr>
                    <th>Organizational Unit</th>
                    <td>{this.props.certificate.subject.organizationalUnit}</td>
                  </tr>
                )}
                {this.props.certificate.subject.location && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.subject.location}</td>
                  </tr>
                )}
                {this.props.certificate.subject.state && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.subject.state}</td>
                  </tr>
                )}
                {this.props.certificate.subject.country && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.subject.country}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {this.props.certificate.subjectAltName && (
              <div>
                <Divider horizontal>Alternative Subjectnames</Divider>
                <table className="data-view">
                  <tbody>
                    {this.props.certificate.subjectAltName.map((name) => {
                      return (
                        <tr key={name}>
                          <td>{name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <Divider horizontal>Issuer</Divider>
            <table className="data-view">
              <tbody>
                <tr>
                  <th>Common Name</th>
                  <td>{this.props.certificate.issuer.commonName}</td>
                </tr>
                {this.props.certificate.issuer.organization && (
                  <tr>
                    <th>Organization</th>
                    <td>{this.props.certificate.issuer.organization}</td>
                  </tr>
                )}
                {this.props.certificate.issuer.organizationalUnit && (
                  <tr>
                    <th>Organizational Unit</th>
                    <td>{this.props.certificate.issuer.organizationalUnit}</td>
                  </tr>
                )}
                {this.props.certificate.issuer.location && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.issuer.location}</td>
                  </tr>
                )}
                {this.props.certificate.issuer.state && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.issuer.state}</td>
                  </tr>
                )}
                {this.props.certificate.issuer.country && (
                  <tr>
                    <th>Location</th>
                    <td>{this.props.certificate.issuer.country}</td>
                  </tr>
                )}
              </tbody>
            </table>
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
      </div>
    );
  }
}
