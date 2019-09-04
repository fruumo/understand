import { SessionDb } from "./SessionDb";
import WeeklyAverage from './statistics/WeeklyAverage';
import SessionCleanUp from './statistics/SessionCleanUp';
import Statistic from "./types/Statistic";

export default class StatisticManager {
  SessionDb: SessionDb;
  Statistics: Statistic[]= []; 
  constructor(SessionDb: SessionDb){
    this.SessionDb = SessionDb;

    this.Statistics.push(new WeeklyAverage(SessionDb));
    this.Statistics.push(new SessionCleanUp(SessionDb));
    this.setupAlarms();
  }

  setupAlarms(){
    for(let s of this.Statistics){
      this.createAlarm(s);
    }
  }

  async getRecommendation(name:string, startTime:number, endTime:number){
    for(let stat of this.Statistics){
      if(stat.name == name){
        return await stat.generateRecommendation(startTime, endTime);
      }
    }
    return false;
  }

  async getStatistic(name:string){
    for(let stat of this.Statistics){
      if(stat.name == name){
        return await stat.getLatestStatistic();
      }
    }
    return false;
  }

  createAlarm(s: Statistic){
    let name = s.name;
    let context = {
      name: name, 
      statistic: s,
      createAlarmHandler: function(s: Statistic){
        let name = s.name;
        let context = {
          name: name,
          statistic: s
        };
        return function(alarm: chrome.alarms.Alarm){
          if(this.name == alarm.name){
            console.log(`${this.name} was called!`);
            this.statistic.calculate(alarm);
          }
        }.bind(context);
      }
    };

    chrome.alarms.get(name, function(alarm:chrome.alarms.Alarm) {
      if(alarm != undefined){
        console.log(`${alarm.name} alarm already exists`)
        return;
      }
      chrome.alarms.onAlarm.addListener(this.createAlarmHandler(this.statistic));

      chrome.alarms.create(this.name, {periodInMinutes: this.statistic.intervalInMinutes});
    }.bind(context));
  }
}