import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from '@angular/cdk/layout';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { Map2Component } from './map2/map2.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, MapComponent, Map2Component],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserAnimationsModule,
    LayoutModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
