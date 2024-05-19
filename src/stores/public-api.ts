import {defineStore} from 'pinia';
import {ISource, ITrial, ITrialIngest} from "factorio-analytics";
import {useDatasets} from "stores/datasets";

export interface publicState {
  trialMap: Map<string, ITrial>
  sourceMap: Map<string, ISource>
  trialList: string[],
  maxTrials: number,
  devMode: boolean
}

/*
* NEXT UP
* DONE when loading a trial, run all the 'y' values by the math on tickInterval so we get a per-tick rate
* DONE Change the chart to show 'minutes' on the X instead of ticks
* DONE Add button to metadata records to allow for easy charting of lines / removing lines from charting
* DONE Change bottom 'charted' area to just show rows not expansion items
* */

export const usePublicApi = defineStore('public', {
  state: () => ({
    trialMap: new Map<string, ITrial>(),
    sourceMap: new Map<string, ISource>(),
    trialList: [] as string[],
    maxTrials: 5,
    devMode: false
  } as publicState),
  getters: {},
  actions: {
    // we can only keep 5 trials open at a time.
    // to add a new one, we remove the oldest one
    addTrial(trial: ITrial) {
      if (trial && trial?.id) {
        // first, check the size. If its already at 5 long, we POP the end first
        if (this.trialList.length >= 5) {
          let rt = this.trialList.pop();
          if (rt)
            this.removeTrial(rt)
        }

        // second, add this new trial to the 'front'
        this.trialList.unshift(trial.id);
        this.trialMap.set(trial.id, trial);
      } else
        throw new Error('Invalid trial object')
    },
    removeTrial(id: string) {
      // remove a trial from storage and in datasets
      const td = this.trialMap.get(id);
      if (td?.source) {
        this.sourceMap.delete(td.source as string);
      }
      this.trialMap.delete(id);
      useDatasets().clearDataset(id);
    },
    addSource(source: ISource) {
      if (source && source?.id) {
        if (this.sourceMap.size >= 5) {
          // remove the oldest source
          const keys = Array.from(this.sourceMap.keys());
          this.sourceMap.delete(keys[0]);
        }
        this.sourceMap.set(source.id, source);
      } else
        throw new Error('Invalid source object')
    },
    async loadSource(id: string): Promise<ISource | undefined> {
      if (this.sourceMap.has(id)) {
        return this.sourceMap.get(id);
      }
      const source = await this.querySource(id);
      this.addSource(source);
      return source;
    },
    async loadTrial(id: string): Promise<ITrial | undefined> {
      // if (this.trialMap.has(id)) {
      //   return this.trialMap.get(id);
      // }
      const trial = await this.queryTrial(id);
      if (trial?.itemMetadata) {
        // need to map the 'avg' and 'total' into arrays
        const avg = Object.entries(trial.itemMetadata.avg).map(([key, value]) => ({key, value}));
        const total = Object.entries(trial.itemMetadata.total).map(([key, value]) => ({key, value}));
        trial.itemMetadata = {avg, total};
      }
      if (trial?.systemMetadata) {
        // need to combine all avg, min, and max metadata into a single array
        // start with the 'min' array - grab the values from min and max to complete
        // final result will be an array of objects with key, min, avg, max
        trial.systemMetadata = Object.entries(trial.systemMetadata.min).map(([key, min]) => {
          const avg = trial.systemMetadata.avg[key];
          const max = trial.systemMetadata.max[key];
          return {key, min, avg, max};
        })
      }
      this.addTrial(trial);
      return trial;
    },
    async clearStorage() {
      this.trialMap.clear();
      this.sourceMap.clear();
      await useDatasets().clearAllDatasets()
    },
    async queryExecutionStatus(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/query/${id}/status`);
      if (response.status === 404) return undefined;
      return await response.json();
    },
    async querySource(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/query/${id}/source`);
      if (response.status === 404) return undefined;
      return await response.json();
    },
    async queryModlist(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/query/${id}/modlist`);
      if (response.status === 404) return undefined;
      return await response.json();
    },
    async queryTrial(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/query/${id}/trial`);
      if (response.status === 404) return undefined;
      return await response.json();
    },
    async queryData(id: string, category: string = 'data_all') {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/query/${id}/${category}`);
      if (response.status === 404) return undefined;
      return await response.json();
    },
    async queryLargestTrialOfSource(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/analysis/largestTrialForSource/${id}`);
      return await response.json();
    },
    async queryDefaultTrialOfSource(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/analysis/defaultTrialForSource/${id}`);
      return await response.text()
    },
    async checkSource(id: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/check/${id}`);
      return await response.json();
    },
    async submitSource(text: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variant: 'source',
          source: text
        })
      });
      return await response.json();
    },
    async submitTrial(params: ITrialIngest) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variant: 'trial',
          trial: params
        })
      });
      return await response.json();
    },
    async submitQuickSource(text: string) {
      const response = await fetch(`${this.devMode === true ? '/api' : ''}/quickSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blueprintStr: text
        })
      });
      return await response.json();
    },
    // async getLargestTrialOfSource(id: string) {
    //   const response = await fetch(`/api/analysis/largestTrialForSource/${id}`);
    //   return await response.json();
    // },
    async loadDefaultTrialForSource(sid: string): Promise<ITrial | undefined> {
      const id = await this.queryDefaultTrialOfSource(sid);
      if (id) {
        let trial = await this.loadTrial(id)
        if (trial?.id) {
          this.addTrial(trial);
        }
        return trial
      } else
        return undefined
    },
  },
});
