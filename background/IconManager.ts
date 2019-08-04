import StateManager from './StateManager';
import StateType from './types/state.type';

const FONT_SIZE_1_DIGIT = "44";
const FONT_SIZE_2_DIGIT = "40";
const FONT_SIZE_3_DIGIT = "34";
class IconManager{
  constructor(sm: StateManager){
    sm.on("state-update", (state) => this.handleStateChange(state));
    this.generateAndSetIcon(-1);
  }
  handleStateChange(state:StateType){
    let hasIconSet = false;
    Object.keys(state.windows).forEach((w) => {
      const windowId = parseInt(w);
      if(state.windows[windowId].active == true){
        this.generateAndSetIcon(state.windows[windowId].tabCount);
        hasIconSet = true;
      }
    });
    if(!hasIconSet){
      this.generateAndSetIcon(-1);
    }
  }
  generateAndSetIcon(tabCount:number){
    let cv = document.createElement('canvas');
    cv.setAttribute("width","64");
    cv.setAttribute("height","64");
    let ctx = cv.getContext("2d");
    //ctx.strokeStyle = "rgb(130, 135, 143)";
    ctx.lineWidth = 4;
    var grd = ctx.createLinearGradient(0, 0, 64,0);
    grd.addColorStop(0, "#E06C78");
    grd.addColorStop(1, "#FA9284");
    //this.roundRect(ctx, 3, 3, 58, 58, 15, false,true);
    ctx.strokeStyle = grd;
    ctx.fillStyle = grd;
    this.roundRect(ctx, 4, 4, 56, 56, 15, true,true);
    ctx.lineWidth = 8;
    if(tabCount >= 100){
      ctx.font = `bold ${FONT_SIZE_3_DIGIT}px Arial`; 
    } else if(tabCount >= 10){
      ctx.font = `bold ${FONT_SIZE_2_DIGIT}px Arial`; 
    } else {
      ctx.font = `bold ${FONT_SIZE_1_DIGIT}px Arial`; 
    }
    ctx.textBaseline = "middle"; 
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${tabCount >= 0? tabCount: ""}`, 32, 34); 
    chrome.browserAction.setIcon({imageData:ctx.getImageData(0,0,64,64)}, console.log);
  }

  roundRect(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number, radius:any, fill:boolean, stroke:boolean) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius:any = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
  }
}
export default IconManager;