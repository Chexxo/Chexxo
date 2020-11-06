import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export default class Configuration extends Component {
  render(): JSX.Element {
    return (
      <div>
        <header>
          <NavLink to="/">Home</NavLink>
        </header>
        Configuration.tsx
      </div>
    );
  }
}
