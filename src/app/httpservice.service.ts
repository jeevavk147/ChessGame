import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpserviceService 
{

  private apiUrl = "https://9psme4ktze.execute-api.ap-south-1.amazonaws.com/userstage/user"

  constructor(private http: HttpClient) { }

  createItem(userId: any): Observable<any> 
  {  
    return this.http.post(this.apiUrl, userId) ;
  }

  getitem(userId: any):Observable<any>
  {
    return this.http.get(`${this.apiUrl}/${userId}`)
  }
  deleteitem(userId:any):Observable<any>
  {
    return this.http.delete(`${this.apiUrl}/${userId}`)
  }
  private errorsubject=new BehaviorSubject<string>('')
  error=this.errorsubject.asObservable()
  errorcall(error)
  {
    this.errorsubject.next(error)
  }
}
