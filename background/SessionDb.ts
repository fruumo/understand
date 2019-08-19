import Dexie from 'dexie';
import * as moment from 'moment';

class SessionDb extends Dexie {
  sessions: Dexie.Table<ISession, number>;
  domains: Dexie.Table<IDomain, number>;
  statistics: Dexie.Table<IStat, number>;
  constructor() {
    if(navigator.storage && navigator.storage.persist){
      navigator.storage.persisted();
    }
    super('SessionDb');
    this.version(1).stores({
      sessions:'++id, domainId, sessionStart, tabId, sessionId, sessionEnd, [tabId+sessionId+sessionEnd]',
      domains: '++id, domain, favicon, category',
      statistics:'++id, statistic, value, domainId, metadata, timestamp'
    });
    
    this.sessions = this.table("sessions");
    this.domains = this.table("domains");
    this.statistics = this.table("statistics");
    (window as any).sdb = this;
  }

  createSession(tabId: number, url: string, sessionId: string){
    return new Promise((resolve, reject) => {
      const currentTime = new Date().getTime();
      if(url.match(/http?[s]?:\/\//) == null){
        return resolve();
      }
      this.getDomainId(url).then((domainId:number) => {
        this.sessions.put({
          domainId:domainId,
          sessionStart: new Date().getTime(),
          sessionEnd: -1,
          tabId: tabId,
          sessionId: sessionId,
        });
        resolve();
      });
    });
  }

  endSession(tabId:number, sessionId: string, time?:number){
    return new Promise((resolve) => {
      // console.log('ending session', tabId, sessionId);
      const currentTime = time == undefined ? new Date().getTime() : time;
      this.sessions.where("[tabId+sessionId+sessionEnd]").equals([tabId, sessionId, -1]).toArray()
      .then((sessions:ISession[]) => {
        for(let session of sessions){
          //if session is shorter than 10 seconds delete it.
          if(currentTime - session.sessionStart < 10000){
            // console.log('less than 10 seconds ignoring');
            this.sessions.delete(session.id);
          } else {
            this.sessions.update(session.id, {sessionEnd: currentTime});
            this.getDomainFromId(session.domainId).then((domain) => {
              if(domain == undefined){
                // console.log('domain not found error');
              } else {
                // console.log(`You spent ${currentTime - session.sessionStart} on ${domain.domain}`);
              }
            });
          }
        }
        resolve();
      })
      .catch((e) => this.databaseErrorHandler(e));
    });
  }
  
  getDomainId(domain: string): Promise<Number>{
    return new Promise((resolve) => {
      let a = document.createElement('a');
      a.href = domain;
      domain = a.host;
      domain = domain.replace(/^www./,"");
      this.domains.where("domain").equals(domain).toArray()
      .then((domains:IDomain[]) => {
        if(domains.length == 0) {
          this.domains.put({domain:domain, favicon: `chrome://favicon/size/16@2x/http://${domain}`, category:''}).then((id) => {
            resolve(id);
          });
        } else {
          resolve(domains[0].id);
        }
      })
      .catch((e) => this.databaseErrorHandler(e));
    });
  }

  getDomainFromId(domainId: number): Promise<IDomain>{
    return new Promise((resolve) => {
      this.domains.get(domainId).then((domain) => {
        resolve(domain);
      });
    });
  }

  getSessions(startTime:number, endTime:number) : Promise<ISession[]> {
    return new Promise((resolve) => {
      this.sessions.where("sessionStart").aboveOrEqual(startTime).and((x) => {return x.sessionEnd <= endTime }).sortBy("sessionStart")
      .then((sessions: ISession[]) => {
        resolve(sessions);
      });
    });
  }

  getSessionsBefore(endTime:number, days: number) : Promise<ISession[]> {
    let startTime:number = moment(endTime).subtract(days, 'days').valueOf();

    return this.getSessions(startTime, endTime);
  }

  insertStatistic(statistic: string, value: number, domainId: number, metadata: string) {
    return new Promise((resolve, reject) => {
      this.statistics.put({
        statistic:statistic,
        value:value,
        domainId: domainId,
        metadata: metadata,
        timestamp: new Date().getTime()
      })
      .then((id) => {
        resolve(id);
      });
    });
  }

  getStatistics(startTime: number, endTime:number): Promise<IStat[]>{
   return new Promise(resolve => {
    this.statistics.where("timestamp").aboveOrEqual(startTime).and((x) => {return x.timestamp <= endTime }).toArray()
    .then((stats: IStat[]) => {
      resolve(stats);
    });
   });
  }

  databaseErrorHandler(e:any){
      window.location.reload();
  }
}

export {SessionDb};

export type ISession = {
  id ?: number,
  domainId: number,
  sessionStart: number,
  sessionEnd: number,
  tabId: number,
  sessionId: string,
}

export type IDomain = {
  id ?: number, 
  domain: string,
  favicon: string, 
  category: string,
}

export type IStat = {
  id ?: number,
  statistic: string,
  value: number,
  domainId: number,
  metadata: string,
  timestamp: number,
}