import StateManager from './StateManager';
import IconManager from './IconManager';
import ConnectionManager from './ConnectionManager';

let sm:StateManager;
let im:IconManager;
let cm: ConnectionManager;
window.onload = () => {
  sm = new StateManager(console.log);
  im = new IconManager(sm);
  cm = new ConnectionManager(sm);
}
