import * as React from "react";
import * as ReactDOM from "react-dom";
import App from './components/App/App';
import './index.scss';
import SessionDataProvider from './components/SessionDataProvider';

const SDP = new SessionDataProvider();
ReactDOM.render(
  (<App sessionDataProvider={SDP}/>),
  document.getElementById("app")
);