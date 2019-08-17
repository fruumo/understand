import * as React from 'react';
import { siteType } from '../../SitesStats';
import moment = require('moment');
import 'moment-duration-format';
import './Site.scss';

type stateType = {
};

type propsType = {
  data: siteType
};

export default class Site extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);
  }


  render(){
    return (
      <div className="site-container-container">
        <div className="site-container">
          <div className="icon-container">
            <img src={this.props.data.icon.replace('http://','http://www.')} className="icon"/>
          </div>
          <div className="stats-container">
            <div className="title-usage-container">
              <div className="title">{this.props.data.title}</div>
              <div className="usage">{moment.duration(this.props.data.time,'milliseconds').format("h[h] mm[m] ss[s]")}</div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width:`${this.props.data.percentage*100}%`}}></div>
            </div>
            <div className="metadata-container">
              <div className="avg-length">Avg. Session - {this.props.data.sessionCount != -1 ? moment.duration(this.props.data.time/this.props.data.sessionCount,'milliseconds').format("h[h] mm[m] ss[s]") : 'N/A'}</div>
              <div className="session-count">Sessions - {this.props.data.sessionCount != -1 ? this.props.data.sessionCount : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}