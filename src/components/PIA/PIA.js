// @flow
import React, { PureComponent } from "react";
import style from "./stylePIA.scss";
import { scaleLinear } from "d3-scale";
import Axis from "components/Axis";
import { line } from "d3-shape";
import { select } from "d3-selection";
import moize from "moize";
import { format } from "d3-format";
import { translator } from "src/utils";
const axisFormat = format("$.2s");
const formatter = format("$,d");

const MAR = {
  l: 40,
  t: 5,
  b: 30,
  r: 15
};

const getX = moize.maxSize(2)((width, domain) =>
  scaleLinear()
    .range([0, width])
    .domain(domain)
);

const getY = moize.maxSize(2)((height, domain) =>
  scaleLinear()
    .domain(domain)
    .range([height, 0])
);

const thresholds = [0, 885, 5336, 1e4].map(d => d * 12);

const calcBenefit = moize((earnings: number): number => {
  if (earnings <= thresholds[1]) return 0.9 * earnings;
  else if (earnings <= thresholds[2])
    return 0.32 * (earnings - thresholds[1]) + calcBenefit(thresholds[1]);
  else return calcBenefit(thresholds[2]) + 0.15 * (earnings - thresholds[2]);
});

const getPath = moize.maxSize(1)((x, y) =>
  line()
    .x(x)
    .y(d => y(calcBenefit(d)))
);

export default class PIA extends PureComponent {
  state = {
    width: 500,
    height: 500
  };

  props: {
    AIE: number,
    maxEarnings: number
  };

  yDomain: [number, number];
  xDomain: [number, number];

  svg: ?HTMLElement;
  rect: ?HTMLElement;

  componentWillMount() {
    this.yDomain = [0, calcBenefit(thresholds[thresholds.length - 1])];
    this.xDomain = [0, this.props.maxEarnings];
  }

  resize = () => {
    this.forceUpdate();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  render() {
    let width, height;
    if (this.svg) {
      let rect = this.svg.getBoundingClientRect();
      width = rect.width - MAR.l - MAR.r;
      height = rect.height - MAR.t - MAR.b;
    } else {
      width = height = 500;
    }
    const y = getY(height, this.yDomain);
    const x = getX(width, this.xDomain);
    const path = getPath(x, y);
    const payment = calcBenefit(this.props.AIE);
    let paymentY = y(payment);
    let AIEX = x(this.props.AIE);
    return (
      <svg ref={d => (this.svg = d)} className={style.svg}>
        <g transform={translator(MAR.l, MAR.t)}>
          <Axis
            transform={translator(0, height + 4)}
            scale={x}
            orient="BOTTOM"
            format={axisFormat}
            ticks={5}
            tickPadding={9}
          />
          <Axis
            ticks={4}
            tickPadding={9}
            scale={y}
            orient="LEFT"
            className={"yAxis"}
            tickSizeInner={-width}
            format={axisFormat}
          />
        </g>
        <g transform={translator(MAR.l, MAR.t)}>
          <path d={path(thresholds)} className={style.formula} />
          <path
            className={style.indicator}
            d={`M0,${paymentY}L${AIEX},${paymentY}L${AIEX},${height - 45}`}
          />
          <g transform={translator(x(this.props.AIE), height - 30)}>
            <text className={style.label}>avg. </text>
            <text className={style.label} y={13}>
              {" "}
              indexed earnings
            </text>
            <text className={style.label} y={25}>
              {formatter(this.props.AIE)}
            </text>
          </g>
          <circle
            r="5"
            className={style.payment}
            transform={translator(
              x(this.props.AIE),
              y(calcBenefit(this.props.AIE))
            )}
          />
          <g transform={translator(4, y(calcBenefit(this.props.AIE)) + 15)}>
            <text className={style.labelLeft}>annual benefit</text>
            <text className={style.labelLeft} y="15">
              {formatter(calcBenefit(this.props.AIE))}
            </text>
          </g>
        </g>
      </svg>
    );
  }
}
