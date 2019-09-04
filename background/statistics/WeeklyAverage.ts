import Statistic from "../types/Statistic";
import * as moment from "moment";
import { ISession } from "../SessionDb";
import 'moment-duration-format';

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
    if(total == 0 || days == 0){
      console.log("Error calculating weekly average!");
      return;
    }
    this.SessionDb.insertStatistic('weeklyAverage', total/days, -1, `${alarm.scheduledTime}`);
  }

  async generateRecommendation(startTime:number, endTime:number){
    // Attempting to get a recommendation too large
    if(moment(startTime).diff(endTime , 'days') != 0){
      console.log("Cannot generate recommendation for time ranges larger than a day");
      return false;
    }
    let statistics = await this.SessionDb.getStatistics('weeklyAverage');
    if(statistics.length == 0){
      return false;
    }
    let todaySessions = await this.SessionDb.getSessions(startTime, endTime);
    let totalTime = this.totalTime(todaySessions);
    let timestamp = moment(statistics[0].timestamp).format("dddd, MMMM Do, hh:mm");
    if(totalTime > statistics[0].value){
      let time = moment.duration(totalTime - statistics[0].value,'milliseconds').format("h[h] mm[m] ss[s]");
      return {
        recommendation: {
          time: time,
          context: 'above'
        },
        metadata: `Average last calculated on ${timestamp}`,
      }
    } else if(totalTime < statistics[0].value){
      let time = moment.duration( statistics[0].value-totalTime,'milliseconds').format("h[h] mm[m] ss[s]");
      return {
        recommendation: {
          time: time,
          context: 'below'
        },
        metadata: `Average last calculated on ${timestamp}`,
      }
    }
    return false;
  }

  async getLatestStatistic(){
    let stat = (await this.SessionDb.getStatistics('weeklyAverage'));
    if(stat.length == 0)
      return []
    else
      return [stat[0]]; 
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