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

export interface datasetState {
  trialItemData: Map<string, any>
  trialElectricData: Map<string, any>
  trialCircuitData: Map<string, any>
  trialPollutionData: Map<string, any>
  trialSystemData: Map<string, any>
  count: number
  queue: string[]
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
    queue: []
  } as datasetState),
  getters: {},
  actions: {
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
