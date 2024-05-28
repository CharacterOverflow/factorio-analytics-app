// function smoothData(data: IPlotData[], smooth: number): IPlotData[] {
//   let smoothedData: IPlotData[] = [];
//   if (smooth >= 1 && data.length >= smooth) {
//     for (let i = 0; i < data.length - smooth + 1; i++) {
//       const windowData = data.slice(i, i + smooth);
//
//       const sum = windowData.reduce((acc, cur) => acc + cur.y, 0);
//       const average = sum / smooth;
//
//       smoothedData.push({
//         x: data[i + Math.floor(smooth / 2)].x,
//         y: average
//       });
//     }
//     Logging.log('verbose', `Smoothed ${data.length} down to ${smoothedData.length}`)
//   } else
//     smoothedData = data;
//   return smoothedData;
// }
import {defineStore} from 'pinia';
import {
  IGameFlowCircuitTick, IGameFlowElectricTick,
  IGameFlowItemTick,
  IGameFlowPollutionTick,
  IGameFlowSystemTick
} from "factorio-analytics";

import {usePublicApi} from "stores/public-api";
import {IChartDatasetConfig, IChartDatasetTemplate} from "components/ChartTypes";

export interface DatasetState {
  trialItemData: Map<string, any>
  trialElectricData: Map<string, any>
  trialCircuitData: Map<string, any>
  trialPollutionData: Map<string, any>
  trialSystemData: Map<string, any>
  count: number
  queue: string[]
  chartData: IChartDatasetTemplate[]
  chartOptions: any
  chartRefresh: boolean
  chartUserTitle: string
  chartSmoothing: number
}

export interface ISmoothReturn {
  xArr: number[]
  yArr: number[]
}

export const useDatasets = defineStore('datasets', {
  state: () => ({
    trialItemData: new Map<string, IGameFlowItemTick>(),
    trialElectricData: new Map<string, IGameFlowElectricTick>(),
    trialCircuitData: new Map<string, IGameFlowCircuitTick>(),
    trialPollutionData: new Map<string, IGameFlowPollutionTick>(),
    trialSystemData: new Map<string, IGameFlowSystemTick>(),
    count: 0,
    queue: [],
    chartData: [],
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            font: {
              size: 18
            }
          },
          display: true,
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Factory Output',
          font: {
            size: 24
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Simulation Time (minutes)',
            font: {
              size: 20
            }
          },
          type: 'linear',
          position: 'bottom',
          ticks: {
            font: {
              size: 10
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Count',
            font: {
              size: 20
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.53)',
            drawTicks: false,
          },
          ticks: {
            font: (context: any) => ({
              size: context.tick?.value === 0 ? 20 : 10,
              weight: context.tick?.value === 0 ? 'bold' : undefined
            }),
            callback: (value: any) => {
              return value
            }
          }
        }
      }
    },
    chartRefresh: false,
    chartUserTitle: 'Factory Chart',
    chartSmoothing: 0,
  } as DatasetState),
  getters: {
    queueLength: (state) => state.queue.length,
  },
  actions: {
    getLabels(interval: number, length: number) {
      // labels should be the same for all datasets
      // will be changed with smoothing, however.
      // whenever we smooth, we need to re-calculate the labels
      let ret = [];

      if (length && interval) {
        for (let i = 0; i < length; i += interval) {
          ret.push(i)
        }
        // if the last record is > props.data.length, set it to props.data.length
        if (ret[ret.length - 1] > length)
          ret[ret.length - 1] = length
      }
      return ret.map((v: any) => {
        return (v / 60) / 60
      }).sort((a, b) => a - b)
    },
    getOptions() {
      let s = this.chartOptions;
      s.plugins.title.text = this.chartUserTitle;
      return s;
    },
    addDatasetToChart(dataset: IChartDatasetConfig) {
      if (dataset) {
        if (!dataset?.data)
          throw new Error('NOT IMPLEMENTED - load data about template');

        dataset.field = dataset.field ?? 'count';
        dataset.borderColor = dataset.borderColor ?? '#000';
        dataset.tension = dataset.tension ?? 0.4;
        dataset.hidden = dataset.hidden ?? false;
        this.chartData = [...this.chartData, dataset];
      } else {
        throw new Error('Null IChartDatasetConfig object cannot be added');
      }
    },
    removeDatasetFromChart(variant: string, label: string, field: string = 'count') {
      // if nothing is found, return false
      // if something is found and removed, return true
      this.chartData = this.chartData.filter((d) => {
        return !(d.variant === variant && d.label === label && d.field === field);
      })
    },
    clearChart() {
      this.chartData = [];
    },
    async loadDataset(trialId: string, variant: string, interval: number) {
      switch (variant) {
        case 'item':
          if (this.trialItemData.has(trialId)) {
            return this.trialItemData.get(trialId);
          }
          break;
        case 'electric':
          if (this.trialElectricData.has(trialId)) {
            return this.trialElectricData.get(trialId);
          }
          break;
        case 'circuit':
          if (this.trialCircuitData.has(trialId)) {
            return this.trialCircuitData.get(trialId);
          }
          break;
        case 'pollution':
          if (this.trialPollutionData.has(trialId)) {
            return this.trialPollutionData.get(trialId);
          }
          break;
        case 'system':
          if (this.trialSystemData.has(trialId)) {
            return this.trialSystemData.get(trialId);
          }
          break;
      }

      const api = usePublicApi();
      const data = await api.queryData(trialId, `data_${variant}`)
      if (data) {
        switch (variant) {
          case 'item':
            // reduce all values by the tickInterval ratio
            this.trialItemData.set(trialId, {
              data: data.data.map((d: IGameFlowItemTick) => {
                return {
                  cons: (d.cons / interval) * 60,
                  prod: (d.prod / interval) * 60,
                  tick: d.tick,
                  label: d.label
                }
              })
            });
            break;
          case 'electric':
            // reduce all values by the tickInterval ratio
            this.trialElectricData.set(trialId, {
              data: data.data.map((d: IGameFlowElectricTick) => {
                return {
                  cons: (d.cons / interval) * 60,
                  prod: (d.prod / interval) * 60,
                  tick: d.tick,
                  label: d.label
                }
              })
            });
            break;
          case 'circuit':
            this.trialCircuitData.set(trialId, data);
            break;
          case 'pollution':
            // reduce all values by the tickInterval ratio ((tickInterval / 60) * 60)
            this.trialPollutionData.set(trialId, {
              data: data.data.map((d: IGameFlowPollutionTick) => {
                return {
                  count: (d.count / interval) * 60,
                  tick: d.tick,
                  label: d.label
                }
              })
            });
            break;
          case 'system':
            this.trialSystemData.set(trialId, data);
            break;
        }
        this.count = this.queue.unshift(`${trialId}_${variant}`);
        if (this.queue && this.count > 20) {
          // @ts-ignore
          const [tid, varnt] = this.queue.pop().split('_');
          switch (varnt) {
            case 'item':
              this.trialItemData.delete(tid);
              break;
            case 'electric':
              this.trialElectricData.delete(tid);
              break;
            case 'circuit':
              this.trialCircuitData.delete(tid);
              break;
            case 'pollution':
              this.trialPollutionData.delete(tid);
              break;
            case 'system':
              this.trialSystemData.delete(tid);
              break;
          }
        }
      }
      return data;
    },
    clearDataset(trialId: string) {
      // clears from ALL datasets - whenever a trial is removed
      this.trialItemData.delete(trialId);
      this.trialElectricData.delete(trialId);
      this.trialCircuitData.delete(trialId);
      this.trialPollutionData.delete(trialId);
      this.trialSystemData.delete(trialId);
    },
    clearAllDatasets() {
      this.trialItemData.clear();
      this.trialElectricData.clear();
      this.trialCircuitData.clear();
      this.trialPollutionData.clear();
      this.trialSystemData.clear();
    },
    smoothData(x: number[], y: number[], smooth: number): ISmoothReturn {
      let smoothedX: number[] = [];
      let smoothedY: number[] = [];
      if (smooth > 1 && (y.length / 2) >= smooth) {
        for (let i = 0; i < y.length - smooth + 1; i++) {
          const windowY = y.slice(i, i + smooth);

          const sumY = windowY.reduce((acc, cur) => acc + cur, 0);
          const averageY = sumY / smooth;

          smoothedX.push(x[i + Math.floor(smooth / 2)]);
          smoothedY.push(averageY);
        }
      } else {
        smoothedX = x;
        smoothedY = y;
      }
      return {xArr: smoothedX, yArr: smoothedY};

    },
  }
})
