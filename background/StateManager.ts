import StateType from "./types/state.type";

class StateManager {

  state:StateType = {
    tabs:{} as any,
    windows:{} as any,
    metadata:{} as any,
    populated: false,
  };
  
  callbacks:{[key:string]:((state:StateType)=>void)[]} = {
    "state-update":[]
  };

  constructor(cb?:(state:StateType)=>void){
    // Populate the tabs already opened at the time of extension loading
    chrome.tabs.query({}, (tabs) => {
      chrome.windows.getAll({populate:false}, (windows) => {
        
        windows.forEach((window) => {
          this.createWindow(window.id);
          if(window.focused){
            this.focusWindow(window.id);
          }
        });

        tabs.forEach((tab) => {
          this.createTab(tab);
        });
        this.state.populated = true;

        this.dispatchStateUpdate();
        this.setupListeners();
        if(cb !== undefined){
          cb(this.state);
        }
      });
    });
  }

  on(type:string, callback: (state:StateType)=>void){
    if(type == "state-update"){
      this.callbacks["state-update"].push(callback);
      return;
    }
    return;
  }

  dispatchStateUpdate(){
    if(!this.state.populated){
      return;
    }
    this.callbacks["state-update"].forEach((cb) => {
      cb(this.state);
    });
      
  }

  setupListeners(): void{
    chrome.tabs.onCreated.addListener((tab) => {
      this.createTab(tab);
    });
    chrome.tabs.onUpdated.addListener((tabId:number, changeInfo:chrome.tabs.TabChangeInfo) => {
      this.updateTab(tabId, changeInfo);
    });
    chrome.tabs.onActivated.addListener((activeInfo:chrome.tabs.TabActiveInfo)=>{
      this.state.tabs[activeInfo.tabId].windowId = activeInfo.windowId;
      this.focusTab(activeInfo.tabId);
    });
    chrome.tabs.onRemoved.addListener((tabId,removeInfo)=>{
      this.removeTab(tabId, removeInfo);
    });
    
    chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
      this.state.windows[detachInfo.oldWindowId].tabCount--;
      this.dispatchStateUpdate();
    });
    
    chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
      this.state.tabs[tabId].windowId = attachInfo.newWindowId;
      this.state.tabs[tabId].index = attachInfo.newPosition;
      this.createWindow(attachInfo.newWindowId);
      this.state.windows[attachInfo.newWindowId].tabCount++;
      this.dispatchStateUpdate();
    });

    chrome.windows.onFocusChanged.addListener((windowId:number) => {
      this.focusWindow(windowId);
    });
    
    chrome.windows.onCreated.addListener((window) => {
      this.createWindow(window.id);
    });

    chrome.windows.onRemoved.addListener((windowId) => {
      this.removeWindow(windowId);
    });
  }

  focusTab(tabId:number){
    const windowId = this.state.tabs[tabId].windowId;
    //incase window hasn't already been created
    this.createWindow(windowId);

    this.state.windows[windowId].activeTabId = tabId;
    this.state.metadata[tabId].lastActive = new Date().getTime();
    this.dispatchStateUpdate();
  }

  updateTab(tabId:number, changeInfo:chrome.tabs.TabChangeInfo):void{
    this.state.tabs[tabId] = {...this.state.tabs[tabId],...changeInfo};
    this.dispatchStateUpdate();
  }

  focusWindow(targetWindowId:number){
    Object.keys(this.state.windows).forEach((w) => {
      const windowId = parseInt(w);
      if(this.state.windows[windowId] != undefined)
        this.state.windows[windowId].active = false;
    });
    //If all windows lost focus dont do anything further
    if(targetWindowId != -1){
      if(this.state.windows[targetWindowId] == undefined){
        this.createWindow(targetWindowId);
      }
      this.state.windows[targetWindowId].active = true;
    }
    this.dispatchStateUpdate();
  }

  removeTab(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo){
    const windowId = this.state.tabs[tabId].windowId;
    if(this.state.windows[windowId] != undefined){
      this.state.windows[windowId].tabCount--;
    }
    delete this.state.metadata[tabId];
    delete this.state.tabs[tabId];
    this.dispatchStateUpdate();
  }

  createTab(tab:chrome.tabs.Tab):void{
    this.state.tabs[tab.id] = tab;
    this.state.windows[tab.windowId].tabCount++;
    this.state.metadata[tab.id] = {lastActive: new Date().getTime()}
    if(this.state.tabs[tab.id].active){
      this.state.windows[tab.windowId].activeTabId = tab.id;
    }
    this.dispatchStateUpdate();
  }

  createWindow(windowId:number){
    if(this.state.windows[windowId] != undefined){
      return;
    }
    this.state.windows[windowId] = {
      tabCount: 0,
      activeTabId:-1,
      active:false,
    };
    this.dispatchStateUpdate();
  }

  removeWindow(windowId:number){
    if(this.state.windows[windowId] == undefined){
      return;
    }
    delete this.state.windows[windowId];
    this.dispatchStateUpdate();
  }

  getState(){
    return this.state;
  }

}

export default StateManager;