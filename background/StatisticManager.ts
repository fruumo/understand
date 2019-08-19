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

      chrome.alarms.create(this.name, {when: new Date().getTime()+2000, periodInMinutes: this.statistic.intervalInMinutes});
    }.bind(context));
  }
}