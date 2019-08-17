import * as React from 'react';
import * as moment from 'moment';
import './Navbar.scss';
import SessionDataProvider from '../../../SessionDataProvider';
const logo = require('../../../../../images/logo.png');

type stateType = {
  dayData:DayData[],
  selected:number,
};

type propsType = {
  sessionDataProvider: SessionDataProvider,
  changeDateRange: (startTime: number, endTime: number) => void,
}

type DayData = {
  title: string,
  startTime: number,
  endTime: number,
}

export default class Navbar extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);
    this.state = {
      dayData: [{title:'No Data', startTime:-1, endTime:-1}],
      selected: 0,
    }
    this.populateDropDown();
    this.dropdownChange = this.dropdownChange.bind(this);
  }

  async populateDropDown(){
    // Time to figure out how much data we have

    const today = new Date().getTime();
    const sessions = await this.props.sessionDataProvider.getSessionsBefore(today, 7);
    console.log(sessions.sessions[0]);
    const dataDays:number = moment().startOf('day').diff(moment(sessions.sessions[0].sessionStart).startOf('day'), 'days');
    let dropdownData: DayData[]  = []

    if(dataDays >= 0){
      const startTime = moment().hour(0).minute(0).second(0).valueOf();
      const endTime = moment().hour(23).minute(59).second(0).valueOf();
      dropdownData.push({title:'Today', startTime: startTime , endTime: endTime});
      this.props.changeDateRange(startTime, endTime);
    }

    if(dataDays >= 1){
      const startTime = moment().subtract(1, 'days').hour(0).minute(0).second(0).valueOf();
      const endTime = moment().subtract(1, 'days').hour(23).minute(59).second(0).valueOf();
      dropdownData.push({title:'Yesterday', startTime: startTime , endTime: endTime});
    }

    if(dataDays >= 1){
      const startTime = moment().subtract(7, 'days').hour(0).minute(0).second(0).valueOf();
      const endTime = moment().hour(23).minute(59).second(0).valueOf();
      dropdownData.push({title:'This week', startTime: startTime , endTime: endTime});
    }
    this.setState({
      dayData:dropdownData
    });
  }

  dropdownChange(e: React.SyntheticEvent) {
    const selected = (e.target as any).value;
    this.setState({
      selected: selected,
    });
    this.props.changeDateRange(this.state.dayData[selected].startTime, this.state.dayData[selected].endTime);
  }
  
  render(){
    return (
      <div className="navbar-container">
        <img src={logo} alt="" className = "logo"/>
        <select 
        onChange={this.dropdownChange} 
        value={
          `${this.state.selected}`
        }>
          {
            this.state.dayData.map((element, i) => {
              return (
                <option value={`${i}`} key={element.title}>{element.title}</option>
              );
            })
          }
        </select>
      </div>
    );
  }
}