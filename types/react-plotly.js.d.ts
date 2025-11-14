// /types/react-plotly.js.d.ts
declare module 'react-plotly.js' {
  import * as React from 'react';
  import Plotly from 'plotly.js-basic-dist';

  /**
   * Props interface for the react-plotly.js component
   * This ensures strong typing, autocompletion, and safety
   */
  export interface PlotParams {
    /** Data traces to plot (required) */
    data: Plotly.Data[];

    /** Optional layout configuration */
    layout?: Partial<Plotly.Layout>;

    /** Optional config settings for the plot */
    config?: Partial<Plotly.Config>;

    /** Optional callback triggered when initialized */
    onInitialized?: (figure: Plotly.Figure) => void;

    /** Optional callback triggered on updates */
    onUpdate?: (figure: Plotly.Figure) => void;

    /** Optional style and CSS class support */
    style?: React.CSSProperties;
    className?: string;

    /** Automatically resize chart with container */
    useResizeHandler?: boolean;
  }

  /**
   * Default export: the Plot React component
   */
  export default class Plot extends React.Component<PlotParams> {}
}

declare module 'plotly.js-basic-dist' {
  import * as Plotly from 'plotly.js';
  export = Plotly;
}
