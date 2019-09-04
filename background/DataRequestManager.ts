import SessionManager from "./SessionManager";
import {ISession, IDomain} from "./SessionDb";
import StatisticManager from "./StatisticManager";
export default class DataRequestManager {
  ssm: SessionManager;
  statisticManager: StatisticManager;

  constructor(ssm: SessionManager, sm: StatisticManager) {
    this.ssm = ssm;
    this.statisticManager = sm;
    this.setupListeners();
  }

  setupListeners() {
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if(message.type == "session-request"){
        this.handleSessionRequest(message).then((sessions) => {
          respond({
            type: "session-response",
            data: sessions
          });
        });
        return true;
      }
    });
  
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if(message.type == "domain-request"){
        this.handleDomainRequest(message).then((domain) => {
          respond({
            type: "domain-response",
            data: domain
          });
        });
        return true;
      }  
    });
    
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if(message.type == "session-before-request"){
        this.handleSessionBeforeRequest(message).then((sessions) => {
          respond({
            type: "session-before-response",
            data: sessions
          });
        });
        return true;
      }  
    });

    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if(message.type == "recommendation-request"){
        this.statisticManager.getRecommendation(message.data.name, message.data.startTime, message.data.endTime).then((recommendation) => {
          respond({
            type: "recommendation-response",
            data: recommendation
          });
        });
        return true;
      }  
    });

    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if(message.type == "statistic-request"){
        this.statisticManager.getStatistic(message.data.name).then((statistic) => {
          respond({
            type: "statistic-response",
            data: statistic
          });
        });
        return true;
      }  
    });
  }

  handleSessionRequest(message:any): Promise<ISession[]>{
    return new Promise((resolve)=> {
      this.ssm.SessionDb.getSessions(message.data.startTime, message.data.endTime)
      .then(resolve);
    });
  }
  
  handleDomainRequest(message:any) : Promise<IDomain>{
    return new Promise((resolve) => {
      this.ssm.SessionDb.getDomainFromId(message.data.domainId)
      .then(resolve);
    });
  }

  handleSessionBeforeRequest(message:any): Promise<ISession[]>{
    return new Promise((resolve) => {
      this.ssm.SessionDb.getSessionsBefore(message.data.endTime, message.data.days)
      .then(resolve);
    })
  }

}