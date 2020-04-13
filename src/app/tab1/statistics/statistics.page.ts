import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSeries } from 'src/app/services/models/time-series.model';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit {
  @ViewChild('totalCanvas', { static: false }) totalCanvas: ElementRef;
  @ViewChild('dailyConfirmCanvas', { static: false }) dailyConfirmCanvas: ElementRef;
  @ViewChild('deathCanvas', { static: false }) deathCanvas: ElementRef;
  @ViewChild('dailyDeathCanvas', { static: false }) dailyDeathCanvas: ElementRef;
  @ViewChild('sampleTestedCanvas', { static: false }) sampleTestedCanvas: ElementRef;
  timeSeries: TimeSeries;
  overall: TimeSeries = {};
  scaleType = 'linear';
  deathScaleType = 'linear';
  sampleScaleType = 'linear';
  constructor(public http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.timeSeries = this.router.getCurrentNavigation().extras.state.timeSeries;
        this.overall = this.router.getCurrentNavigation().extras.state.overall;
      }

      this.overall.total = this.timeSeries.statewise.find(e => {
        return e.state === 'Total';
      });
      this.overall.total.deltaactive = (+this.overall.total.deltaconfirmed -
        +this.overall.total.deltadeaths -
        +this.overall.total.deltarecovered).toString();
      console.log(this.overall);
    });
  }

  getSymbol(num: string): string {
    return parseInt(num) >= 0 ? '+' : '-';
  }

  ionViewDidEnter() {
    this.generateConfirmedChart();
    this.generateDeathChart();
    this.generateSampleTestedChart();
  }

  toggleScale(canvas: string) {


    switch (canvas) {
      case 'confirmed':
        if (this.scaleType === 'linear') {
          this.scaleType = 'logarithmic';
        } else {
          this.scaleType = 'linear';
        }
        this.generateConfirmedChart();
        break;
      case 'death':
        if (this.deathScaleType === 'linear') {
          this.deathScaleType = 'logarithmic';
        } else {
          this.deathScaleType = 'linear';
        }
        this.generateDeathChart();
        break;
      case 'sample':
        if (this.sampleScaleType === 'linear') {
          this.sampleScaleType = 'logarithmic';
        } else {
          this.sampleScaleType = 'linear';
        }
        this.generateSampleTestedChart();
        break;
      default:
        break;
    }
  }

  discardLeadingZeros(a: Array<any>, key: string): Array<any> {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < a.length && a.length > 0; index++) {
      if (a[index][key] === '0') {
        a.shift();
        index = 0;
      } else {
        break;
      }
    }
    return a;
  }

  generateSampleTestedChart() {
    let sampleTested: { date: string, count: string }[] = this.timeSeries.tested
      .map(item => {
        return {
          date: item.updatetimestamp.split(' ')[0],
          count: item.totalsamplestested,
        };
      });
    console.log(sampleTested);

    const chart: Chart = new Chart(this.sampleTestedCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: sampleTested.map(s => s.date),
        datasets: [
          {
            data: sampleTested.map(s => s.count),
            borderColor: `rgba(255, 99, 132, 1)`,
            backgroundColor: `rgba(255, 99, 132, 0.2)`,
          }
        ]
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
            type: this.sampleScaleType,
            gridLines: {
              display: true
            },
            position: 'right',
            ticks: {
              beginAtZero: false,
              callback: (value, index, values) => {
                if (this.sampleScaleType === 'linear') { return value; }
                if (value === 1000000) { return '1M'; }
                if (value === 100000) { return '100K'; }
                if (value === 10000) { return '10K'; }
                if (value === 25000) { return '25K'; }
                if (value === 50000) { return '50K'; }
                if (value === 75000) { return '75K'; }
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
  }
  generateConfirmedChart() {
    let totalConfirmed: { date: string, count: string, dailyCount: string }[] = this.timeSeries.cases_time_series
      .map(item => {
        return {
          date: item.date,
          count: item.totalconfirmed,
          dailyCount: item.dailyconfirmed
        };
      });

    totalConfirmed = this.discardLeadingZeros(totalConfirmed, 'count');
    const chart: Chart = new Chart(this.totalCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: totalConfirmed.map(s => s.date),
        datasets: [
          {
            data: totalConfirmed.map(s => s.count),
            borderColor: `rgba(255, 99, 132, 1)`,
            backgroundColor: `rgba(255, 99, 132, 0.2)`,
          }
        ]
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
    totalConfirmed = this.discardLeadingZeros(totalConfirmed, 'dailyCount');
    const dailyChart: Chart = new Chart(this.dailyConfirmCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: totalConfirmed.map(s => s.date),
        datasets: [
          {
            data: totalConfirmed.map(s => s.dailyCount),
            borderColor: `rgba(255, 99, 132, 1)`,
            backgroundColor: `rgba(255, 99, 132, 1)`,
          }
        ]
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
  }

  generateDeathChart() {
    let deathConfirmed: { date: string, count: string, dailyCount: string }[] = this.timeSeries.cases_time_series
      .map(item => {
        return {
          date: item.date,
          count: item.totaldeceased,
          dailyCount: item.dailydeceased
        };
      });
    deathConfirmed = this.discardLeadingZeros(deathConfirmed, 'count');
    const deathChart: Chart = new Chart(this.deathCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: deathConfirmed.map(s => s.date),
        datasets: [
          {
            data: deathConfirmed.map(s => s.count),
            borderColor: `rgba(109,109,109, 1)`,
            backgroundColor: `rgba(109,109,109, 0.2)`,
          }
        ]
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
            type: this.deathScaleType,
            gridLines: {
              display: true
            },
            position: 'right',
            ticks: {
              beginAtZero: false,
              callback: (value, index, values) => {
                if (this.deathScaleType === 'linear') { return value; }
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

    const dailyDeathChart: Chart = new Chart(this.dailyDeathCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: deathConfirmed.map(s => s.date),
        datasets: [
          {
            data: deathConfirmed.map(s => s.dailyCount),
            borderColor: `rgba(109,109,109, 1)`,
            backgroundColor: `rgba(109,109,109, 1)`,
          }
        ]
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
  }
}
