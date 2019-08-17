import {ISession, IDomain} from '../../background/SessionDb';

type SessionResponse = {
  data:ISession[];
}
export default class SessionDataProvider {

    constructor() {

    }

    getSessions(startTime: number, endTime: number): Promise<{sessions:ISession[], domains:IDomain[]}> {
      return new Promise( (resolve, reject) => {
        chrome.runtime.sendMessage({type:"session-request", data:{startTime:startTime, endTime:endTime}}, 
        async (sessions:SessionResponse) => {
          const domainsData:IDomain[] = await this.getDomains(sessions.data);
          resolve({sessions:sessions.data, domains: domainsData});
        });
      });
    }

    getSessionsBefore(endTime:number, days: number): Promise<{sessions:ISession[], domains:IDomain[]}> {
      return new Promise( (resolve, reject) => {
        chrome.runtime.sendMessage({type:"session-before-request", data:{endTime:endTime, days:days}}, 
        async (sessions:SessionResponse) => {
          const domainsData:IDomain[] = await this.getDomains(sessions.data);
          resolve({sessions:sessions.data, domains: domainsData});
        });
      });
    }

    getDomains(sessions:ISession[]): Promise <IDomain[]>{
      return new Promise((resolve) => {
        let promiseArray:any[] = [];
        sessions.forEach((session) => {
          promiseArray.push(new Promise((resolve) => {
            chrome.runtime.sendMessage({type:"domain-request", data:{domainId:session.domainId}}, (domain:{data:IDomain}) => {
              resolve(domain.data);
            });
          }));
        });
        Promise.all(promiseArray).then((domains:IDomain[]) => {
          let domObj:IDomain[] = [];
          domains.forEach(domain => {
            domObj[domain.id] = domain;
          });
          resolve(domObj);
        });
      });
    }

}