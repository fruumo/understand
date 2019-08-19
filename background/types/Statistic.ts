import { SessionDb } from "../SessionDb";

export default class Statistic{
  intervalInMinutes: number;
  name: string;
  SessionDb: SessionDb;
  constructor(SessionDb: SessionDb) {
    this.SessionDb = SessionDb;
  }
  calculate(alarm: chrome.alarms.Alarm): void {

  }

}