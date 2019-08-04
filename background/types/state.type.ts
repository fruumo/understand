type StateType = {
  tabs:{[key:number]:chrome.tabs.Tab},
  windows:{
    [key:number]:{
      tabCount:number,
      activeTabId:number,
      active: boolean,
    }
  },
  metadata:{
    [key:number]:{
      lastActive: number,
    }
  },
  populated: boolean,
};

export default StateType;