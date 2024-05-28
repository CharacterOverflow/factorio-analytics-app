export interface IChartDatasetConfig extends IChartDatasetTemplate {
  label: string,
  variant?: string,
  field?: string,
  borderColor: string,
  tension?: number,
  data: number[],
  hidden?: boolean,
}

export interface IChartDatasetTemplate {
  // core parts of how we identify the data
  label: string,
  variant?: string,
  field?: string,

  // display variables
  borderColor: string,
  displayName?: string,
  showAsNegative?: boolean,
}
