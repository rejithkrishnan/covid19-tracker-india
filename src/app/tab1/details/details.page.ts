import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSeries } from 'src/app/services/models/time-series.model';
import { Statewise } from 'src/app/services/models/state-wise.model';
import { DistrictData } from 'src/app/services/models/district-data.model';
import { NavController } from '@ionic/angular';
import { Chart } from 'chart.js';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  @ViewChild('confirmedCanvas', { static: false }) confirmedCanvas: ElementRef;
  @ViewChild('dailyConfirmedCanvas', { static: false }) dailyConfirmedCanvas: ElementRef;
  public state: string;
  timeSeries: TimeSeries;
  stateData: Statewise;
  stateDailyData: JSON;
  scaleType = 'linear';
  districtData: DistrictData[] = new Array<DistrictData>();
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
    // this.activatedRoute.paramMap.subscribe(paramMap => {
    //   this.state = paramMap.get('state');
    //   // console.log(this.state);
    // });
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.timeSeries = this.router.getCurrentNavigation().extras.state.timeSeries;
        this.state = this.router.getCurrentNavigation().extras.state.state;
        const districtData = this.router.getCurrentNavigation().extras.state.districtData;
        this.stateDailyData = this.router.getCurrentNavigation().extras.state.stateDailyData;
        // console.log(this.stateDailyData);
        const districts = districtData[this.state]["districtData"];
        Object.keys(districts).forEach(d => {
          this.districtData.push({
            district: d,
            confirmed: districts[d]["confirmed"],
            lastupdatedtime: districts[d]["lastupdatedtime"],
            delta: districts[d]["delta"]
          });
        });
        // console.log(this.districtData);

        this.stateData = this.timeSeries.statewise.find(s => {
          return s.state === this.state;
        });
        console.log(this.stateData);



      } else {
        this.navCtrl.navigateRoot('/tabs/tab1');
      }
    });
  }

  ionViewDidEnter() {
    // generating charts
    this.generateConfirmedChart();
  }


  getSymbol(num: string): string {
    return parseInt(num) >= 0 ? '+' : '-';
  }

  onSearchChange(event) {
    const val = event.target.value.toLowerCase();
    // this.stateWise = this.timeSeries.statewise.filter(s => s.state.toLowerCase().indexOf(val) !== -1);
  }

  toggleScale(canvas: string) {
    if (this.scaleType === 'linear') {
      this.scaleType = 'logarithmic';
    } else {
      this.scaleType = 'linear';
    }
    this.generateConfirmedChart();
  }

  generateConfirmedChart() {
    const stateConfirmed: { date: string, count: string }[] = this.stateDailyData['states_daily']
      .filter(item => {
        return item.status === 'Confirmed';
      }).map(item => {
        return {
          date: item.date,
          count: item[this.stateData.statecode.toLocaleLowerCase()]
        };
      });
    let sum: number;
    const stateConfirmedTotal: { date: string, count: string }[] = this.stateDailyData['states_daily']
      .filter(item => {
        return item.status === 'Confirmed';
      }).map(item => {
        sum = +item[this.stateData.statecode.toLocaleLowerCase()] + (sum || 0);
        return {
          date: item.date,
          count: sum.toString()
        };
      });
    // console.log(stateConfirmedTotal);

    const chart: Chart = new Chart(this.confirmedCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: stateConfirmed.map(s => s.date),
        datasets: [{
          data: stateConfirmed.map(s => s.count),
          backgroundColor: `rgba(255, 99, 132, 1)`,
          borderColor: `rgba(255, 99, 132, 1)`,
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
            type: 'linear',
            gridLines: {
              display: true
            },
            position: 'right',
            ticks: {
              beginAtZero: false,
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

    const lineChart: Chart = new Chart(this.dailyConfirmedCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: stateConfirmedTotal.map(s => s.date),
        datasets: [{
          data: stateConfirmedTotal.map(s => s.count),
          backgroundColor: `rgba(255, 99, 132, 0.5)`,
          borderColor: `rgba(255, 99, 132, 1)`,
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
            type: this.scaleType,
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

  getRowClass() {
    return { 'datatable-row-center': true };
  }
}
