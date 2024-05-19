export interface IChartDatasetConfig extends IChartDatasetTemplate {
  label: string,
  //smooth: number,
  borderColor: string,
  tension: number,
  //raw_data: number[],
  data: number[],
  hidden?: boolean,
  variant?: string,
  field?: string,
}

export interface IChartDatasetTemplate {
  label: string,
  borderColor: string,
  variant?: string,
  field?: string,
}
