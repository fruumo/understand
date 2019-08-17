import * as React from 'react';
import * as moment from 'moment';
import 'moment-duration-format';
import {ISession, IDomain} from '../../../../../background/SessionDb';

import './MajorStats.scss';

type stateType = {
  totalTime: number,
  tabsOpened: number,
  websitesVisited:number,
};

type propsType = {
  sessions:ISession[],
  domains:IDomain[],
}

export default class MajorStats extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);
    this.state = {
      totalTime:0,
      tabsOpened:0,
      websitesVisited:0,
    }
  }

  static getDerivedStateFromProps(props: propsType, state: stateType) {
    let totalTime = 0;
    let tabIds:any = {};
    let siteCount = 0;
    for(let session of props.sessions){
      if(session.sessionEnd == -1){
        if(moment().diff(moment(session.sessionStart), 'hours') <= 1){
          session.sessionEnd = new Date().getTime(); 
        } else {
          session.sessionStart = -1;
        }
      }
      let sessionLength = session.sessionEnd - session.sessionStart;
      totalTime += (sessionLength/1000);
      if(tabIds[session.tabId.toString()] == undefined){
        tabIds[session.tabId.toString()]=0;
      }
    }

    for(let i= 0; i < props.domains.length; i++){
      if(props.domains[i] === undefined){
        continue;
      }
      siteCount++;
    }

    return {
      totalTime: totalTime,
      tabsOpened: Object.keys(tabIds).length,
      websitesVisited: siteCount,
    }
  }

  render(){
    return (
      <div className="major-stats-container-container">
        <div className="major-stats-container">
          <div className="stat">
            <div className="title">
              Usage
            </div>
            <div className="value">
              {moment.duration(this.state.totalTime,'seconds').format("h[h] mm[m]")}
            </div>
          </div>
          <div className="stat">
            <div className="title">
              Tabs
            </div>
            <div className="value">
              {this.state.tabsOpened}
            </div>
          </div>
          <div className="stat">
            <div className="title">
              Websites
            </div>
            <div className="value">
              {this.state.websitesVisited}
            </div>
          </div>
        </div>
      </div>
    );
  }
}