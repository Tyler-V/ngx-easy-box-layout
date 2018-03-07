import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EasyBoxLayoutComponent } from './easy-box-layout/easy-box-layout/easy-box-layout.component';
import { EasyBoxComponent } from './easy-box-layout/easy-box/easy-box.component';
import { EasyBoxLayoutService } from './easy-box-layout/easy-box-layout.service';

@NgModule({
  declarations: [
    AppComponent,
    EasyBoxLayoutComponent,
    EasyBoxComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    EasyBoxLayoutService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
