import { Injectable } from '@angular/core';
import { signOut } from 'aws-amplify/auth';
import { MoveChange } from 'ngx-chess-board';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketServiceService {

  constructor() { }
  private ws:WebSocket;
  private move=new Subject<any>;

  connect(url:string)
  {
    this.ws=new WebSocket(url);
    this.ws.onmessage=(event)=>{
      this.move.next(event.data)
    }
  }

  sendmove(move)
  {
    this.ws.send(JSON.stringify(move))
  }

  getmove():Observable<MoveChange["move"]>
  {
    return this.move.asObservable()
  }
}
