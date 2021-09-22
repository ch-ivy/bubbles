import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { Map2Component } from './map2/map2.component';

const routes: Routes = [
  { path: '3', component: MapComponent },
  {
    path: '2',
    component: Map2Component,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
