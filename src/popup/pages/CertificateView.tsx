import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export default class CertificateView extends Component {
  render(): JSX.Element {
    return (
      <div>
        <header>
          <NavLink to="/">Home</NavLink>
        </header>
        CertificateView.tsx
      </div>
    );
  }
}