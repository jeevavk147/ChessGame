import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { json } from 'stream/consumers';
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
    console.log(JSON.stringify(move))
  }

  getmove():Observable<any>
  {
    return this.move.asObservable()
  }
}
