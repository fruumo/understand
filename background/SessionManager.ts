import { SessionDb, ISession } from "./SessionDb";

class SessionManager{
  sessionId = this.generateSessionId();
  lastTabId: number = -1;
  SessionDb: SessionDb;

  invalidatorTimeStamp: number;

  constructor() {
    this.SessionDb = new SessionDb();
    this.setupListeners();
    chrome.windows.getLastFocused({populate:true}, (window) => {
      if(window == undefined){
        return;
      }
      for(let tab of window.tabs){
        if(tab.active){
          this.SessionDb.createSession(tab.id, tab.url, this.sessionId);
          this.lastTabId = tab.id;
        }
      }
    });
    this.invalidatorTimeStamp = new Date().getTime();
    setInterval(() => this.checkInvalidation(), 3000);
  }

  checkInvalidation(){
    if(this.lastTabId == -1){
      return;
    }
    let currentTime = new Date().getTime();
    if(currentTime - this.invalidatorTimeStamp >= 5*60*1000){
      console.log("Timestamp mismatch, invalidating current sessions with old stamp");
      this.SessionDb.endSession(this.lastTabId, this.sessionId, this.invalidatorTimeStamp);
      chrome.tabs.get(this.lastTabId, (tab) => {
        console.log(this.lastTabId, tab.url);
        this.SessionDb.createSession(this.lastTabId, tab.url, this.sessionId);
      });
    }
    this.invalidatorTimeStamp = currentTime;
  }

  setupListeners(){
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this.SessionDb.endSession(tabId, this.sessionId);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if(!changeInfo.url || !tab.active){
        return;
      }
      this.SessionDb.endSession(tabId, this.sessionId);
      this.SessionDb.createSession(tabId, changeInfo.url, this.sessionId);
      this.lastTabId = tabId;
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.SessionDb.endSession(this.lastTabId, this.sessionId);
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if(!tab || tab.url == undefined || tab.status != "complete"){
          chrome.runtime.lastError;
          return;
        } else {
          this.SessionDb.createSession(activeInfo.tabId, tab.url, this.sessionId);
          this.lastTabId = activeInfo.tabId;
        }
      });
    });

    chrome.windows.onFocusChanged.addListener((windowId) => {
      this.SessionDb.endSession(this.lastTabId, this.sessionId);
      if(windowId == -1){
        this.lastTabId = -1;
        return;
      }
      chrome.windows.get(windowId, {populate:true}, (window) => {
        const tabs = window.tabs;
        for(let tab of tabs){
          if(tab.active){
            this.SessionDb.createSession(tab.id, tab.url, this.sessionId);
            this.lastTabId = tab.id;
            return;
          }
        }
      });
    });

    chrome.windows.onRemoved.addListener((windowId) => {
      //handle this at some point
    });
  }

  generateSessionId(){
    return btoa(new Date().getTime().toString());
  }
}

export default SessionManager;