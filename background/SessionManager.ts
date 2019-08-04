class SessionManager{
  sessionId = this.generateSessionId();
  
  constructor() {
    this.setupListeners();
  }

  setupListeners(){

  }

  generateSessionId(){
    return btoa(new Date().getTime().toString());
  }
}