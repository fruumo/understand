
import SessionManager from './SessionManager';
import DataRequestManager from './DataRequestManager';

let ssm: SessionManager;
let dm: DataRequestManager;
window.onload = () => {
  ssm = new SessionManager();
  dm = new DataRequestManager(ssm);
}
