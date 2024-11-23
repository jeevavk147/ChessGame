import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { AppComponent } from './app.component';
import { ActionsComponent } from './components/actions/actions.component';
import { FenComponent } from './components/fen/fen.component';
import { MovesComponent } from './components/moves/moves.component';
import { SettingsComponent } from './components/settings/settings.component';

import {Amplify} from 'aws-amplify';
import awsmobile from 'src/aws-exports'
import {AmplifyAuthenticatorModule} from '@aws-amplify/ui-angular'

Amplify.configure(awsmobile);

@NgModule({
    declarations: [AppComponent, ActionsComponent, SettingsComponent, MovesComponent, FenComponent],
    imports: [BrowserModule, FormsModule, NgxChessBoardModule,AmplifyAuthenticatorModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
