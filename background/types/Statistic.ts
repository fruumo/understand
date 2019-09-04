import { SessionDb, IStat } from "../SessionDb";


export type Recommendation = {
  recommendation: any,
  metadata: string,
}
export default class Statistic{
  intervalInMinutes: number;
  name: string;
  SessionDb: SessionDb;
  constructor(SessionDb: SessionDb) {
    this.SessionDb = SessionDb;
  }
  calculate(alarm: chrome.alarms.Alarm): void {

  }

  async generateRecommendation(startTime:number, endTime:number): Promise<Recommendation|false>{
    return false;
  }

  async getLatestStatistic() : Promise<IStat[]>{
    return [];
  }

}