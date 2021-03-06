import * as _ from 'lodash';

import { Interval, SeriesData } from '../core/interfaces';
import { SeriesId, DataLoader, TBySeriesId, LoadedSeriesData } from './interfaces';

export function chainLoaders(...loaders: DataLoader[]): DataLoader {

  const chainedLoader: DataLoader = (seriesIds: SeriesId[],
                                      xDomain: Interval,
                                      currentYDomains: TBySeriesId<Interval>,
                                      chartPixelWidth: number,
                                      currentData: TBySeriesId<SeriesData>,
                                      currentLoadedData: TBySeriesId<LoadedSeriesData>,
                                      context?: any): TBySeriesId<Promise<LoadedSeriesData>> => {

    let accumulator: TBySeriesId<Promise<LoadedSeriesData>> = {};
    let seriesIdsToLoad: SeriesId[] = seriesIds;

    loaders.forEach(loader => {
      const loadedSeries: TBySeriesId<Promise<LoadedSeriesData>> = loader(
        seriesIdsToLoad,
        xDomain,
        currentYDomains,
        chartPixelWidth,
        currentData,
        currentLoadedData,
        context
      );

      seriesIdsToLoad = seriesIdsToLoad.filter(id => !loadedSeries[ id ]);
      _.assign(accumulator, loadedSeries);
    });

    const rejectedIds: TBySeriesId<Promise<LoadedSeriesData>> = _.fromPairs<Promise<LoadedSeriesData>>(seriesIdsToLoad.map(seriesId => [
      seriesId,
      Promise.reject(new Error(`No loader specified that can handle series ID '${seriesId}'`))
    ] as [ string, Promise<LoadedSeriesData> ]));

    return _.assign({}, accumulator, rejectedIds);
  };

  return chainedLoader;
}
