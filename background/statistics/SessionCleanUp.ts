import Statistic from "../types/Statistic";
import { ISession } from "../SessionDb";
import moment = require("moment");

export default class SessionCleanup extends Statistic{
  
  intervalInMinutes: number = 60;
  name: string = "sessionCleanUp";
  
  // This statistic is going clean up invalid sessions.
  async calculate(alarm: chrome.alarms.Alarm){
    let sessions = await this.SessionDb.getSessions(moment().subtract(1, 'hours').valueOf(), moment().valueOf());
    sessions.forEach((session) => {
      if(session.sessionEnd != -1){return;}
      chrome.tabs.get(session.tabId, async (tab)=>{
        if(!tab || tab.active == false){
          chrome.runtime.lastError;
          console.log('cleaning up ', session, tab);
          this.SessionDb.sessions.delete(session.id);
          return;
        }
        let domain =  await this.SessionDb.getDomainFromId(session.domainId);
        if(!tab.url.includes(domain.domain)){
          this.SessionDb.sessions.delete(session.id);
          console.log('cleaning up ', session, tab);
          return;
        }
      });
    });
  }


}