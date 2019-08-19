import Statistic from "../types/Statistic";
import * as moment from "moment";
import { ISession } from "../SessionDb";

export default class WeeklyAverage extends Statistic{
  
  intervalInMinutes: number = 60 * 24;
  name: string = "weeklyAverage";
  
  // This statistic is going to calculate the total time spent on average per day.
  async calculate(alarm: chrome.alarms.Alarm){
    let now = moment(alarm.scheduledTime);
    let total = 0;
    let days = 0;

    for(let i =0; i < 7; i++){
      let endTime = now.subtract(i, 'days').valueOf();
      let startTime = this.cloneDate(now).startOf('day').valueOf(); 
      let sessions = await this.SessionDb.getSessions(startTime, endTime);
      let totalTime = this.totalTime(sessions);
      if(i == 0){
        now.endOf('day');
      }
      if(totalTime == 0){
        continue;
      }
      total+= totalTime;
      days++;
    }

    this.SessionDb.insertStatistic('weeklyAverage', total/days, -1, `${alarm.scheduledTime}`);
  }

  cloneDate(a: moment.Moment){
    return moment(a.valueOf());
  }

  // returns total time in milliseconds
  totalTime(sessions: ISession[]){
    let total:number = 0;
    for(let session of sessions){
      if(session.sessionEnd == -1){
        continue;
      }
      total += session.sessionEnd - session.sessionStart;
    }
    return total;
  }

}