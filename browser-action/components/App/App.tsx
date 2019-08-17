import * as React from 'react';
import {ISession, IDomain} from '../../../background/SessionDb';
import Navbar from './components/navbar/Navbar';
import SessionDataProvider from '../SessionDataProvider';
import './App.scss';
import MajorStats from './components/MajorStats/MajorStats';
import SitesStats from './components/SitesStats/SitesStats';

type stateType = {
  startTime: number,
  endTime: number,
  sessions: ISession[],
  domains: IDomain[],
};
type propsType = {
  sessionDataProvider: SessionDataProvider
}

export default class App extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);

    this.state = {
      startTime: -1,
      endTime: -1,
      sessions: [],
      domains:[],
    };
    this.handleDateRangeChange = this.handleDateRangeChange.bind(this);
  }

  async updateSessions(){
    const sess = await this.props.sessionDataProvider.getSessions(this.state.startTime, this.state.endTime);
    console.log(sess);
    this.setState({
      sessions:sess.sessions,
      domains: sess.domains
    });
  }

  handleDateRangeChange(startTime:number, endTime:number) {
    this.setState({
      startTime: startTime,
      endTime: endTime
    }, () => {
      this.updateSessions();
    });
  }

  render(){
    return (
      <div className = "app-container">
        <div className="nav widget">
          <Navbar sessionDataProvider={this.props.sessionDataProvider} changeDateRange={this.handleDateRangeChange}/>
        </div>
        <div className="widget">
          <MajorStats sessions = {this.state.sessions} domains = {this.state.domains}/>
        </div>
        <div className="widget">
          <div className="widget-title">
            Sites
          </div>
          <SitesStats sessions = {this.state.sessions} domains = {this.state.domains}/>
        </div>
      </div>
    );
  }
}