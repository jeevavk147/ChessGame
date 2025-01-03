import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebSocketServiceService } from '../web-socket-service.service';
import { HttpserviceService } from '../httpservice.service';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { ColorInput, MoveChange, NgxChessBoardComponent, NgxChessBoardModule, PieceIconInput, PieceTypeInput } from 'ngx-chess-board';
import { FenComponent } from '../components/fen/fen.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

@Component({
  selector: 'app-main',
  standalone: true,
  imports:[ BrowserModule, FormsModule, NgxChessBoardModule,HttpClientModule,AmplifyAuthenticatorModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{
  constructor(private ws:WebSocketServiceService,private httpservice:HttpserviceService){}
 
  public usercolor:string|undefined=undefined;
  private currentmove=''
  private error
  private userId
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
                              if(item.item.color=="OUT")
                                {
                                    this.error="User Pool is Full !!!"
                                    this.httpservice.errorcall(this.error)
                                    this.handleSignOut()
                                 }    
                        })  
                  }
              }) 
          
        //auth event
        Hub.listen('auth', ({ payload }) => {
          switch (payload.event) {
            case 'signedIn':
              console.log('signed in')
              break;
            case 'signedOut':
              this.delete()
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
          if(this.currentmove!=move )
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
  @HostListener('window:unload',['$event'])
  unloadHandler(event:Event)
  {
      this.delete()
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
      if(this.isplayerturn===false)
          {
              console.log("undo called")
              this.boardManager.undo()
          }
           
      this.fen = this.boardManager.getFEN();
      this.pgn = this.boardManager.getPGN();     
      if((this.usercolor=="WHITE"&&move.color=="white")||(this.usercolor=="BLACK"&&move.color=="black"))
         {
          this.currentmove=move.move
          this.ws.sendmove({"action":"sendmove","data":move.move})
           this.isplayerturn=false
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



