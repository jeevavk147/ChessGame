import { Component, OnChanges, OnInit} from '@angular/core';
import { HttpserviceService } from './httpservice.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
    constructor(private http:HttpserviceService){}
    public error=''
    ngOnInit()
    {
        this.http.error.subscribe((error)=>{
            this.error=error
            if(error.length>0)
             { alert(this.error)}
            this.error=''
        })
    }

}