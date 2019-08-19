import * as React from 'react';
import * as moment from 'moment';
import {ISession, IDomain} from '../../../../../background/SessionDb';

import './SitesStats.scss';
import Site from './components/Site/Site';

export type siteType = {
  icon: string,
  title: string, 
  percentage: number,
  time: number,
  sessionCount: number,
}

type stateType = {
  sites: siteType[]
};

type propsType = {
  sessions:ISession[],
  domains:IDomain[],
}

export default class SitesStats extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);
    this.state = {
      sites:[]
    }
  }

  static getDerivedStateFromProps(props: propsType, state: stateType) {
    let temp: siteType[] = [];
    let siteTypeSort = (a:siteType, b: siteType) => {
      if(a.time > b.time){
        return -1
      }
      if(a.time == b.time){
        return 0;
      } else {
        return 1;
      }
    }
    for(let session of props.sessions){
      if(session.sessionEnd == -1){
        if(moment().diff(moment(session.sessionStart), 'hours') <= 1){
          session.sessionEnd = new Date().getTime(); 
        } else {
          session.sessionStart = -1;
        }
      }

      if(temp[session.domainId] == undefined){
        temp[session.domainId] = {
          icon: props.domains[session.domainId].favicon,
          title: props.domains[session.domainId].domain,
          percentage:0,
          time: 0,
          sessionCount: 0,
        };
      }

      temp[session.domainId].sessionCount++;
      temp[session.domainId].time+= session.sessionEnd - session.sessionStart;
    }
    temp = temp.filter((s)=> {
      return s != undefined;
    });
    temp.sort(siteTypeSort);

    if(temp.length > 5){
      let totalExcessTime = 0;
      let websiteCount = 0;
      let sessionCount = 0;
      for(let i =5; i< temp.length; i++){
        totalExcessTime+= temp[i].time;
        websiteCount++;
        sessionCount += temp[i].sessionCount;
      }
      temp = temp.slice(0,5);
      temp.push({
        icon: 'chrome://favicon/size/16@1x/http://',
        title: `${websiteCount} other websites`,
        percentage:-1,
        time: totalExcessTime,
        sessionCount: sessionCount,
      });
    }

    for(let i = 0; i< temp.length; i++){
      temp[i].percentage = temp[i].time/temp[0].time;
    }
    return {
      sites: temp
    };
  }
  render(){
    return (
      <div className="site-stats-container-container">
        <div className="site-stats-container">
          {
            this.state.sites.map((site) => {
              return (<Site data={site} key={site.title}/>);
            })
          }
        </div>
      </div>
    );
  }
}