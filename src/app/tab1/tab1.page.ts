import { Component, ViewChild, ElementRef } from '@angular/core';
import { IndiaService } from '../services/india.service';
import { Patient } from '../services/models/patient.model';
import { HttpClient } from '@angular/common/http';
import { TimeSeries } from '../services/models/time-series.model';
import { Chart } from 'chart.js';
import { Statewise } from '../services/models/state-wise.model';
import { Router, NavigationExtras } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild('totalCanvas', { static: false }) totalCanvas: ElementRef;
  @ViewChild('recoveryCanvas', { static: false }) recoveryCanvas: ElementRef;
  @ViewChild('deathCanvas', { static: false }) deathCanvas: ElementRef;
  patients: Patient[] = [];
  overall: TimeSeries = {};
  timeSeries: TimeSeries = {};
  stateWise: Statewise[] = [];
  private totalChart: Chart;
  private recoveryChart: Chart;
  private deathChart: Chart;
  isRecovery = false;
  isDeath = false;
  subscription: any;
  districtData: JSON;
  stateDailyData: JSON;
  chartData: { elt: any, dataSet: string, color: string, scale: string };
  scaleType = 'linear';
  constructor(public platform: Platform, public indiaService: IndiaService, public http: HttpClient, public router: Router) { }

  toggleScale(canvas: string) {
    if (this.scaleType === 'linear') {
      this.scaleType = 'logarithmic';
    } else {
      this.scaleType = 'linear';
    }
    // console.log(this.scaleType);

    this.totalChart = this.generateCharts({
      elt: this.totalCanvas.nativeElement,
      dataSet: 'totalconfirmed',
      color: '255, 99, 132',
      scale: this.scaleType
    });
  }
  ionViewWillEnter() {
    // this.getPatients();
    this.getTimeSeries();
    this.getDistrictData();
    this.getStateDailyData();
  }

  async generateCharts(data: Chartdata): Chart {
    // console.log(this.timeSeries.cases_time_series.filter(c => c[dataSet] !== '0'));

    const chart: Chart = new Chart(data.elt, {
      type: 'line',
      data: {
        labels: this.timeSeries.cases_time_series.filter(c => c[data.dataSet] !== '0').map(c => c.date).concat(['', '']),
        datasets: [{
          data: this.timeSeries.cases_time_series.filter(c => c[data.dataSet] !== '0').map(c => parseInt(c[data.dataSet])),
          backgroundColor: [
            `rgba(${data.color}, 0.2)`],
          borderColor: [
            `rgba(${data.color}, 1)`],
        }]
      },
      options: {
        elements: {
          point: {
            radius: 0
          }
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            type: data.scale,
            gridLines: {
              display: true
            },
            position: 'right',
            ticks: {
              beginAtZero: false,
              callback: (value, index, values) => {
                if (this.scaleType === 'linear') { return value; }
                if (value === 1000000) { return '1M'; }
                if (value === 100000) { return '100K'; }
                if (value === 10000) { return '10K'; }
                if (value === 5000) { return '5K'; }
                if (value === 1000) { return '1K'; }
                if (value === 500) { return '500'; }
                if (value === 100) { return '100'; }
                if (value === 50) { return '50'; }
                if (value === 10) { return '10'; }
                if (value === 0) { return '0'; }
                return null;
              }
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              maxTicksLimit: 11
            }
          }]
        }
      }
    });
    return chart;
  }

  getDistrictData() {
    this.http.get('https://api.covid19india.org/state_district_wise.json')
      .subscribe((data: JSON) => {
        // console.log(data);
        this.districtData = data;
      });
  }

  getStateDailyData() {
    this.http.get('https://api.covid19india.org/states_daily.json')
      .subscribe((data: JSON) => {
        // console.log(data);
        this.stateDailyData = data;

      });
  }

  getPatients() {
    this.http.get('https://api.covid19india.org/raw_data.json')
      .subscribe((data: { raw_data: Patient[] }) => {
        // console.log(data.raw_data);
        this.patients = data.raw_data.slice(0, 15);
      });
  }

  getTimeSeries() {
    this.http.get('https://api.covid19india.org/data.json')
      .subscribe((data: TimeSeries) => {
        // console.log(data);
        // console.log(data.key_values[0]);
        this.timeSeries = data;
        this.overall.total = data.statewise.find(e => {
          return e.state === 'Total';
        });
        this.overall.total.deltaactive = (+this.overall.total.deltaconfirmed -
          +this.overall.total.deltadeaths -
          +this.overall.total.deltarecovered).toString();
        // console.log(this.overall.total);

        this.stateWise = this.timeSeries.statewise.map(s => {
          s.deltaactive = (+s.deltaconfirmed -
            +s.deltadeaths -
            +s.deltarecovered).toString();
          return s;
        });
        // console.log(this.overall);
        this.totalChart = this.generateCharts({
          elt: this.totalCanvas.nativeElement,
          dataSet: 'totalconfirmed',
          color: '255, 99, 132',
          scale: this.scaleType
        });
        this.generateCharts({
          elt: this.recoveryCanvas.nativeElement,
          dataSet: 'totalrecovered',
          color: '76, 175, 80',
          scale: this.scaleType
        });
        this.generateCharts({
          elt: this.deathCanvas.nativeElement,
          dataSet: 'totaldeceased',
          color: '158, 158, 158',
          scale: this.scaleType
        });

      });
  }

  doRefresh(event) {
    // console.log('Begin async operation');

    setTimeout(() => {
      this.ionViewWillEnter();
      // console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }

  onSearchChange(event) {
    const val = event.target.value.toLowerCase();
    this.stateWise = this.timeSeries.statewise.filter(s => s.state.toLowerCase().indexOf(val) !== -1);
  }

  getSymbol(num: string): string {
    return parseInt(num) >= 0 ? '+' : '-';
  }

  toggleVisibility(elt) {
    if (elt === 'death') {
      this.isDeath = !this.isDeath;
    }
    if (elt === 'recovered') {
      this.isRecovery = !this.isRecovery;
    }
  }

  getRowClass(row: Statewise) {
    if (row.state === 'Total') {
      return 'totalrow';
    }
  }
  gotoState(event) {
    if (event.row.state === 'Total') {
      return;
    }
    // console.log(this.stateDailyData);
    
    const navExtra: NavigationExtras = {
      state: {
        timeSeries: this.timeSeries,
        state: event.row.state,
        districtData: this.districtData,
        stateDailyData: this.stateDailyData
      }
    };
    this.router.navigate(['/tabs/tab1/details', event.row.state], navExtra);

  }

  onStattistics(){
    const navExtra: NavigationExtras = {
      state: {
        timeSeries: this.timeSeries,
        overall: this.overall
      }
    };
    this.router.navigate(['/tabs/tab1/statistics'], navExtra);
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }
}

interface Chartdata {
  elt: any;
  dataSet: string;
  color: string;
  scale: string;
}


