import { Component,  HostListener, OnInit, ViewChild } from '@angular/core';
import {
    MoveChange,
    NgxChessBoardComponent,
    PieceIconInput
} from 'ngx-chess-board';
import {
    ColorInput,
    PieceTypeInput
} from 'ngx-chess-board';
import { FenComponent } from './components/fen/fen.component';
import { WebSocketServiceService } from './web-socket-service.service';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { HttpserviceService } from './httpservice.service';
import { Hub } from 'aws-amplify/utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
    constructor(private ws:WebSocketServiceService,private httpservice:HttpserviceService){}
   
    private usercolor:string|undefined=undefined;
    private currentmove=''
    private userId
    private usercount
    private isplayerturn:boolean=false;
    private move;
    private wsurl="wss://fth52n7v67.execute-api.ap-south-1.amazonaws.com/chess/";
    async  currentAuthenticatedUser() {
          const {  userId } = await getCurrentUser();
          this.userId=userId
            this.httpservice.createItem({userId:userId}).subscribe(
                {
                    next:()=>{
                          this.httpservice.getitem(userId).subscribe((item)=>{
                            this.usercolor=item.item.color
                            console.log(this.usercolor,typeof this.usercolor)
                            if(this.usercolor=='WHITE')
                                {
                                  this.isplayerturn=true
                                }
                             if(item.item.color=="BLACK")
                               {
                                 console.log('called for reverse') 
                                 this.boardManager.reverse()
                                }  
                          })  
                    }
                }) 
            
                this.httpservice.getitem(userId).subscribe((item)=>{
                  this.usercolor=item.item.color
                  console.log(this.usercolor,typeof this.usercolor)
                  if(this.usercolor=='WHITE')
                      {
                        this.isplayerturn=true
                      }
                   if(item.item.color=="BLACK")
                     {
                       console.log('called for reverse') 
                       this.boardManager.reverse()
                      } 
                })

         
          //auth event
        Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
              case 'signedIn':
                this.currentAuthenticatedUser()
                break;
              case 'signedOut':
                console.log('user have been signedOut successfully.');
                break;
            }
          });
      }
      async  handleSignOut() {
        try {
          await signOut();
        } catch (error) {
          console.log('error signing out: ', error);
        }
      }  
        ngOnInit(): void  {
        //Http
        this.currentAuthenticatedUser()
        //WebSocket 
        this.ws.connect(this.wsurl);
        this.ws.getmove().subscribe((move)=> {
            this.move=move;
            if(this.currentmove!=move && this.usercolor!='WHITE'||'BLACK')
              { 
                this.isplayerturn=true
            }
            this.boardManager.move(this.move);
            
          })
    }


    @HostListener('window:beforeunload',['$event'])
    beforeunloadHandler(event:Event)
    {
        this.delete()
    }
    onAuthStateChange(event:any)
    {
        if(event.state==='signedin')
        {
            console.log("auth called")
        }
    }
    delete(): void {
               this.httpservice.deleteitem(this.userId).subscribe()
    }

    @ViewChild('board')
    boardManager: NgxChessBoardComponent;

    @ViewChild('fenManager') fenManager: FenComponent;
    public fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    private currentStateIndex: number;
    manualMove = 'd2d4';
    icons: PieceIconInput = {
        blackBishopUrl: '',
        blackKingUrl: '',
        blackKnightUrl: '',
        blackPawnUrl: '',
        blackQueenUrl: '',
        blackRookUrl: '',
        whiteBishopUrl: '',
        whiteKingUrl: '',
        whiteKnightUrl: '',
        whitePawnUrl: '',
        whiteQueenUrl: '',
        whiteRookUrl: ''
    };

    public darkTileColor = 'rgb(97, 84, 61)';
    public lightTileColor = '#BAA378';
    public size = 400;
    public dragDisabled = false;
    public drawDisabled = false;
    public lightDisabled = false;
    public darkDisabled = false;
    public freeMode = false;
    public addPieceCoords: string = 'a4';
    public selectedPiece = '1';
    public selectedColor = '1';
    public pgn: string = '';

    public reset(): void {
        alert('Resetting board');
        this.boardManager.reset();
        this.fen = this.boardManager.getFEN();
        this.freeMode = false;
    }

    public reverse(): void{
        this.boardManager.reverse();
    }

    public undo(): void {
        this.boardManager.undo();
        this.fen = this.boardManager.getFEN();
        this.pgn = this.boardManager.getPGN();
    }

    public setFen(): void {
        if (this.fen) {
            this.boardManager.setFEN(this.fen);
            
        }
    }

    public moveCallback(move: MoveChange): void 
    {
        if(this.isplayerturn==false)
            {
                console.log("undo called")
                this.boardManager.undo()
            }
             
        this.fen = this.boardManager.getFEN();
        this.pgn = this.boardManager.getPGN();     
        this.currentmove=move.move
        if((this.usercolor=="WHITE"&&move.color=="white")||(this.usercolor=="BLACK"&&move.color=="black"))
           {
            this.ws.sendmove({"action":"sendmove","data":move.move})
             this.isplayerturn=false
           console.log("playerturn from movecallback: ",this.isplayerturn)
           console.log(this.usercolor,typeof this.usercolor,typeof move.color);
           }         
    }

    public moveManual(): void {
        this.boardManager.move(this.manualMove);
    }

    getFEN() {
        let fen = this.boardManager.getFEN();
        alert(fen);
    }

    showMoveHistory() {
        alert(JSON.stringify(this.boardManager.getMoveHistory()));
    }

    switchDrag() {
        this.dragDisabled = !this.dragDisabled;
    }

    switchDraw() {
        this.drawDisabled = !this.drawDisabled;
    }

    switchDarkDisabled() {
        this.darkDisabled = !this.darkDisabled;
    }

    switchLightDisabled() {
        this.lightDisabled = !this.lightDisabled;
    }

    switchFreeMode() {
        this.freeMode = !this.freeMode;
    }

    addPiece() {
        let piece = this.resolveSelectedPiece();
        let color = this.resolveSelectedColor();
        this.boardManager.addPiece(piece, color, this.addPieceCoords);
    }

    private resolveSelectedPiece(): PieceTypeInput {
        switch (this.selectedPiece) {
            case '1':
                return PieceTypeInput.QUEEN;
            case '2':
                return PieceTypeInput.KING;
            case '3':
                return PieceTypeInput.ROOK;
            case '4':
                return PieceTypeInput.BISHOP;
            case '5':
                return PieceTypeInput.KNIGHT;
            case '6':
                return PieceTypeInput.PAWN;
        }
    }

    private resolveSelectedColor(): ColorInput {
        switch (this.selectedColor) {
            case '1':
                return ColorInput.LIGHT;
            case '2':
                return ColorInput.DARK;
        }
    }

    public setPgn() {
        this.boardManager.setPGN(this.pgn);
    }

    loadDefaultPgn() {
        this.pgn = '1. c4 b5 2. cxb5 c6 3. bxc6 Nxc6 4. Qa4 a6\n' +
            '5. Qxa6 Rb8 6. b3 d5 7. f4 e5 8. fxe5 f6\n' +
            '9. exf6 gxf6 10. Nf3 f5 11. Ne5 Bb7 12. Qxb7 Na7\n' +
            '13. Qxb8 Qxb8 14. Kf2 Kd8 15. Nc3 Be7 16. Nc4 Bf6\n' +
            '17. Nb6 Nb5 18. Nbxd5 f4 19. Ne4 Na7 20. Nexf6';
        this.setPgn();
    }

    getPGN() {
        alert(this.boardManager.getPGN());
    }

}


