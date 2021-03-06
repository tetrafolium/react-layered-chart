import * as React from 'react';
import { deprecate } from 'react-is-deprecated';

export const interval = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

export const pointDatum = React.PropTypes.shape({
  xValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

export const spanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

export const bucketDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  minYValue: React.PropTypes.number.isRequired,
  maxYValue: React.PropTypes.number.isRequired,
  firstYValue: React.PropTypes.number.isRequired,
  lastYValue: React.PropTypes.number.isRequired
});

export const xSpanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  color: deprecate(React.PropTypes.string, 'xSpanDatum\'s \'color\' prop is deprecated and may not be respected by all layers')
});

export const ticks = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.number,
  React.PropTypes.arrayOf(React.PropTypes.number)
]);

export const tickFormat = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.string
]);

export const axisSpecPartial = {
  scale: React.PropTypes.func,
  ticks: ticks,
  tickFormat: tickFormat,
  color: React.PropTypes.string
};

export const defaultChartState = React.PropTypes.shape({
  xDomain: interval,
  yDomains: React.PropTypes.objectOf(interval)
});

export default {
  interval,
  pointDatum,
  spanDatum,
  bucketDatum,
  xSpanDatum,
  ticks,
  tickFormat,
  axisSpecPartial,
  defaultChartState
};
