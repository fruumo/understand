import * as React from 'react';
import {Recommendation} from '../../../../../background/types/Statistic';
import './AverageUsage.scss';

type stateType = {
  recommendation: Recommendation|false
};

type propsType = {
  startTime: number,
  endTime:number,
}

export default class AverageUsage extends React.Component<propsType, stateType> {

  constructor(props:propsType) {
    super(props);
    this.state = {
      recommendation: false
    }
  }
  componentDidMount(){
    this.updateData();
  }
  
  componentDidUpdate(oldProps:propsType){
    if(oldProps.startTime != this.props.startTime || oldProps.endTime != this.props.endTime){
      this.updateData();
    }
  }

  updateData(){
    chrome.runtime.sendMessage({
      type:'recommendation-request', 
      data:{name:'weeklyAverage', startTime: this.props.startTime, endTime:this.props.endTime}
    }, (resp: {data:Recommendation|false}) => {
      this.setState({recommendation:resp.data});
    });
  }

  render(){
    if(this.state.recommendation == false){
      return <div></div>
    } else 
    return (
      <div className="widget">
        <div className="recommendation-container-container">
          <div className="recommendation-container">
            <div className="recommendation" title={this.state.recommendation.metadata}>
              You are <span className = "time">{this.state.recommendation.recommendation.time}</span>&nbsp;<span className="context">{this.state.recommendation.recommendation.context}</span> your daily average usage for this week.
            </div>
          </div>
        </div>
      </div>
    );
  }
}