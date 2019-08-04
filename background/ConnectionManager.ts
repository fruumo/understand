import StateManager from './StateManager';

class ConnectionManager{

  sm:StateManager;
  ports: chrome.runtime.Port[] = [];
  constructor(sm:StateManager) {
    this.sm = sm;
    chrome.runtime.onConnect.addListener((port:chrome.runtime.Port) => this.onConnection(port));
    sm.on('state-update',() => {
      this.ports.forEach(port => this.sendCurrentState(port));
    });
  }

  onConnection(port: chrome.runtime.Port){
    this.ports.push(port);
    this.sendCurrentState(port);
  }

  sendCurrentState(port:chrome.runtime.Port){
    port.postMessage({
      type:'state',
      data:{
       ...this.sm.getState() 
      }
    });
  }

}

export default ConnectionManager;