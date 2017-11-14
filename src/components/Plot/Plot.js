// @flow
import React, { Component, PureComponent, MouseEvent } from "react";
import style from "./stylePlot.scss";
import type { RawDatum, Dot, Datum } from "types";
import { format } from "d3-format";
import moize from "moize";
import { scaleLinear } from "d3-scale";
import { transition } from "d3-transition";
import { easeCubic, easeCubicOut } from "d3-ease";
import Axis from "components/Axis";
import { line, curveMonotoneX } from "d3-shape";
import { select, selectAll } from "d3-selection";
import { translator, binder, uniqueId } from "src/utils";

const MAR = {
  l: 50,
  t: 10,
  b: 35,
  r: 15
};
const getX = moize.maxSize(1)((width, domain) =>
  scaleLinear()
    .range([0, width])
    .domain(domain)
    .clamp(true)
);
const getY = moize.maxSize(1)((height, domain) =>
  scaleLinear()
    .domain(domain)
    .range([height, 0])
    .clamp(true)
);
const getBarWidth = moize.maxSize(1)((width, data) =>
  Math.max(width / data.length * 0.6, 2)
);
const pathMaker = moize.maxSize(5)((key, x, y) =>
  line()
    .x(d => x(d.year))
    .y(d => y(d[key]))
    .curve(curveMonotoneX)
);
const yAxisFormat = format("$.2s");

class AIELine extends PureComponent {
  line: ?HTMLElement;
  props: {
    AIE: number,
    step: number,
    width: number,
    y(d: number): number
  };
  // componentWillUpdate({ step, y, width, AIE }) {
  //   if (!this.line) return;
  //   console.log(this.sel.attr("x2"));
  //   if (step >= 4 && !this.sel.attr("x2"))
  //     this.sel
  //       .transition()
  //       .duration(350)
  //       .ease(easeCubic)
  //       .attr("x2", width);
  //   if (step < 4 && this.props.step >= 4)
  //     this.sel
  //       .transition()
  //       .duration(350)
  //       .ease(easeCubic)
  //       .attr("x2", 0);
  // }
  // componentDidMount() {
  //   this.sel = select(this.line);
  //   if (this.props.step >= 4)
  //     this.sel
  //       .transition()
  //       .duration(350)
  //       .ease(easeCubic)
  //       .attr("x2", this.props.width);
  //   // select(this.line).attr("x2", 0);
  // }
  format = format("$,d");
  render() {
    const { step, width, y, AIE } = this.props;
    return (
      <g className={style.AIE} transform={translator(0, y(AIE))}>
        <text y={-5}>avg. indexed earnings</text>
        <line
          ref={d => (this.line = d)}
          x1={0}
          x2={width}
          className={style.AIE}
        />
      </g>
    );
  }
}

class MyRect extends PureComponent {
  rect: ?HTMLElement;
  props: {
    className: string,
    value: number,
    scale: Function,
    x: number,
    idx: number,
    width: number
  };
  componentDidMount() {
    this.sel = select(this.rect);
  }
  componentWillUpdate({ scale, value, idx, width }) {
    if (this.props.scale !== scale || this.props.value !== value) {
      const height = scale.range()[0];
      this.sel
        .transition("moving")
        .ease(easeCubicOut)
        .delay(idx * 3)
        .duration(300)
        .attr("height", height - scale(value))
        .attr("y", scale(value));
    }
    if (this.props.width !== width) {
      this.sel
        .transition("growShrink")
        .ease(easeCubicOut)
        .delay(idx * 2)
        .duration(600)
        .attr("width", width)
        .attr("transform", `translate(${-width / 2},0)`);
    }
  }

  render() {
    let { className, x, width } = this.props;
    return <rect ref={d => (this.rect = d)} x={x} className={className} />;
  }
}

export default class App extends Component {
  props: {
    data: Array<Datum>,
    dots: Array<Dot>,
    addDot(id: string, year: number, earnings: number): void,
    deleteDot(id: string): void,
    updateDot(id: string, year: number, earnings: number): void,
    updateTooltip(
      left: number,
      top: number,
      year: number,
      earnings: number
    ): void,
    closeTooltip(): void,
    AIE: number,
    yDomain: [number, number],
    xDomain: [number, number],
    step: number
  };

  selected: string;
  svg: ?HTMLElement;
  rect: ?HTMLElement;
  dots: ?HTMLElement;
  isDragging: boolean;

  selected = "";
  isDragging = false;

  onMouseUp = () => {
    this.isDragging = false;
    this.props.closeTooltip();
    this.props.storeHistory();
  };

  onDoubleClick = (id: string, e: MouseEvent) => {
    // e.preventDefault();
    // e.stopPropagation();
    this.isDragging = false;
    this.props.deleteDot(id);
  };

  onMouseDownRect = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0 || e.ctrlKey) return;
    if (!this.rect) throw Error("no rect");
    const { left, top, height, width } = this.rect.getBoundingClientRect();
    const y = getY(height, this.props.yDomain);
    const x = getX(width, this.props.xDomain);
    const earnings = Math.round(y.invert(e.clientY - top)),
      year = Math.round(x.invert(e.clientX - left));
    if (earnings < 500) return;
    let id = uniqueId();
    this.props.addDot(id, year, earnings);
    this.props.updateTooltip(e.clientX, e.clientY, year, earnings);
    this.selected = id;
    this.isDragging = true;
  };

  onMouseDownDot = (id: string, e: MouseEvent) => {
    this.selected = id;
    this.isDragging = true;
  };

  onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    if (!this.rect) throw Error("no rect");
    const { left, top, height, width } = this.rect.getBoundingClientRect();
    const y = getY(height, this.props.yDomain);
    const x = getX(width, this.props.xDomain);
    const earnings = Math.round(y.invert(e.clientY - top)),
      year = Math.round(x.invert(e.clientX - left));
    if (earnings < 100) return;
    this.props.updateDot(this.selected, year, earnings);
    this.props.updateTooltip(e.clientX, e.clientY, year, earnings);
  };

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  onResize = () => {
    this.forceUpdate();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
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
    const { step, dots, data, AIE, yDomain, xDomain } = this.props;
    const y = getY(height, yDomain);
    const x = getX(width, xDomain);
    const barWidth = getBarWidth(width, data);

    return (
      <svg ref={d => (this.svg = d)} className={style.svg}>
        <defs>
          <filter id="f3">
            <feDropShadow dx="4" dy="5" stdDeviation="3.5" opacity="0.1" />
          </filter>
        </defs>
        <g transform={translator(MAR.l, MAR.t)}>
          <Axis
            transform={translator(0, height + 4)}
            scale={x}
            orient="BOTTOM"
            tickPadding={9}
          />
          <Axis
            scale={y}
            orient="LEFT"
            format={yAxisFormat}
            ticks={6}
            tickSizeInner={-width}
            tickPadding={9}
            className={"yAxis"}
          />
        </g>
        <g
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseUp}
          transform={translator(MAR.l, MAR.t)}
          onMouseMove={this.onMouseMove}
        >
          <rect
            onMouseDown={this.onMouseDownRect}
            className={style.bg}
            width={width}
            height={height}
            ref={d => (this.rect = d)}
          />
          <g>
            {data.map(d => (
              <rect
                key={d.year}
                className={style.earnings + " " + (step > 1 ? style.light : "")}
                height={height - y(d.earnings)}
                transform={translator(x(d.year) - barWidth / 2, y(d.earnings))}
                width={barWidth}
              />
            ))}
          </g>
          <g>
            {data.map((d, idx) => {
              let value;
              if (step <= 1) value = 0;
              else if (step === 2) value = d.earningsCapped;
              else if (step === 3) value = d.earningsAdjusted;
              else value = d.counted ? d.earningsAdjusted : 0;
              let bw = step >= 3 ? barWidth * 0.3 : barWidth;
              return (
                <MyRect
                  key={d.year}
                  className={
                    step >= 3 ? style.earningsAdjusted : style.earningsCapped
                  }
                  scale={y}
                  idx={idx}
                  value={value}
                  x={x(d.year)}
                  width={bw}
                />
              );
            })}
          </g>
          <g ref={d => (this.dots = d)} className={style.dots}>
            {dots.map((d, i) => (
              <circle
                key={d.id}
                cx={x(d.year)}
                cy={y(d.earnings)}
                r="6"
                onMouseDown={binder(this.onMouseDownDot, d.id)}
                onDoubleClick={binder(this.onDoubleClick, d.id)}
                className={style.dot}
              />
            ))}
          </g>
          {step >= 2 &&
            step <= 4 && (
              <path
                className={style.cap}
                d={pathMaker("cap", x, y)(data)}
                filter="url(#f3)"
              />
            )}
          {step <= 4 && (
            <path
              className={style.awi}
              d={pathMaker("awi", x, y)(data)}
              filter="url(#f3)"
            />
          )}
          {step >= 5 && <AIELine step={step} AIE={AIE} y={y} width={width} />}
        </g>
      </svg>
    );
  }
}
