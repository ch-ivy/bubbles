import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GoogleMap, MapGeocoder } from '@angular/google-maps';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  /**
   *
   */
  apiLoaded: Observable<boolean>;
  loaded = new BehaviorSubject<boolean>(false);
  allPanels = [];
  selectedPanel: any;

  @ViewChild(GoogleMap, { static: false }) set map(m: GoogleMap) {
    if (m) {
      this.initDrawingManager(m);
    }
  }

  drawingManager: any;

  m_options: google.maps.MapOptions = {
    zoom: 25,
    maxZoom: 30,
    center: { lat: 35.28012407249113, lng: 33.89656978540845 },
    mapTypeId: 'satellite',
    rotateControl: true,
  };

  //Local Variable defined
  formattedaddress = ' ';
  s_options = {
    componentRestrictions: {
      country: ['USA'],
    },
  };
  public AddressChange(address: any) {
    //setting address from API to local variable
    this.formattedaddress = address.formatted_address;
  }
  constructor(
    httpClient: HttpClient,
    private geocoder: MapGeocoder,
    private elRef: ElementRef
  ) {
    this.apiLoaded = httpClient
      .jsonp(
        'https://maps.googleapis.com/maps/api/js?key=' +
          environment.AGM_KEY +
          '&libraries=places,drawing&language=en',
        'callback'
      )
      .pipe(
        map(() => {
          this.loaded.next(true);
          return true;
        }),
        catchError(() => of(false))
      );
  }

  ngOnInit() {
    this.loaded.subscribe((x) => {
      console.log(x);
      if (x) {
        this.geocoder
          .geocode({
            address: '1600 Amphitheatre Parkway, Mountain View, CA',
          })
          .subscribe((results) => {
            console.log(results);
          });
      }
    });
  }
  initDrawingManager(map: GoogleMap) {
    const markerOptions: any = {
      icon: '../assets/panel.svg',
      draggable: true,
      optimized: true,
    };
    const drawingOptions = {
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [google.maps.drawing.OverlayType.MARKER],
      },
      markerOptions,
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(
      drawingOptions
    );
    this.drawingManager.setMap(map.googleMap);
  }

  addMarker(event: google.maps.MapMouseEvent) {
    console.log(event);
  }
  setSelection(shape) {
    this.selectedPanel = shape;
    shape.setEditable(true);
  }

  deleteSelectedShape() {
    if (this.selectedPanel) {
      this.selectedPanel.setMap(null);
    }
  }
}
