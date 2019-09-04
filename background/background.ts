
import SessionManager from './SessionManager';
import DataRequestManager from './DataRequestManager';
import StatisticManager from './StatisticManager';

let ssm: SessionManager;
let dm: DataRequestManager;
let statisticManager: StatisticManager;
window.onload = () => {
  ssm = new SessionManager();
  statisticManager = new StatisticManager(ssm.SessionDb);
  dm = new DataRequestManager(ssm, statisticManager);
  
  // @TODO: NEED TO REPLACE
  chrome.runtime.onInstalled.addListener((details) => {
    if(details.reason == "install"){
      chrome.tabs.create({
        url:"http://www.fruumo.com/understand/installed",
        active:true,
        selected:true,
      });
    }
  });

}
