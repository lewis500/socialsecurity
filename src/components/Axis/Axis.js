//@flow
import React from "react";
import { scaleLinear } from "d3-scale";

type Scale = {
  (x: number): number,
  domain(): Array<number>,
  range(): Array<number>,
  ticks(count: number): Array<number>,
  tickFormat(count: number, fmt: ?string): (val: number) => string,
  copy(): Scale,
  round(): boolean
};

type AxisProps = {
  scale?: Scale, //d3 scale
  orient?: "TOP" | "RIGHT" | "LEFT" | "BOTTOM",
  format?: (d: number) => string,
  tickSizeInner?: number,
  tickSizeOuter?: number,
  tickPadding?: number,
  strokeWidth?: number,
  strokeColor?: string,
  tickFont?: string,
  tickFontSize?: number,
  transform: string,
  className: string
};

const defaultProps = {
  orient: "BOTTOM",
  ticks: 10,
  scale: scaleLinear(),
  format: d => d,
  tickSizeInner: 6,
  tickSizeOuter: 6,
  tickPadding: 3,
  strokeWidth: 1,
  className: "",
  strokeColor: "black",
  tickFont: "sans-serif",
  tickFontSize: 10,
  transform: "translate(0,0)"
};

export default (props: AxisProps) => {
  const {
    orient,
    tickSizeInner,
    tickPadding,
    tickSizeOuter,
    strokeWidth,
    strokeColor,
    tickFont,
    tickFontSize,
    format,
    scale,
    ticks,
    className,
    transform
  } = { ...defaultProps, ...props };

  const k = orient === "TOP" || orient === "LEFT" ? -1 : 1;
  const isRight = orient === "RIGHT";
  const isLeft = orient === "LEFT";
  const isTop = orient === "TOP";
  const isBottom = orient === "BOTTOM";
  const isHorizontal = isRight || isLeft;
  const x = isHorizontal ? "x" : "y";
  const y = isHorizontal ? "y" : "x";
  const halfWidth = strokeWidth / 2;
  const range0 = scale.range()[0] + halfWidth;
  const range1 = scale.range().slice(-1)[0] + halfWidth;

  const tickTransformer = isHorizontal
    ? d => translateY(scale, d)
    : d => translateX(scale, d);

  const spacing = Math.max(tickSizeInner, 0) + tickPadding;
  return (
    <g
      className={className}
      fill={"none"}
      fontSize={tickFontSize}
      fontFamily={tickFont}
      textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
      strokeWidth={strokeWidth}
      transform={transform}
    >
      <path
        className="domain"
        stroke={strokeColor}
        d={
          isHorizontal
            ? `M${k * tickSizeOuter},${range0}H${halfWidth}V${range1}H${k *
                tickSizeOuter}`
            : `M${range0},${k * tickSizeOuter}V${halfWidth}H${range1}V${k *
                tickSizeOuter}`
        }
      />
      {scale.ticks(ticks).map((v, idx) => {
        let lineProps = {
          stroke: strokeColor,
          [`${x}2`]: k * tickSizeInner,
          [`${y}1`]: halfWidth,
          [`${y}2`]: halfWidth
        };

        let textProps = {
          fill: strokeColor,
          dy: isTop ? "0em" : isBottom ? "0.71em" : "0.32em",
          [`${x}`]: k * spacing,
          [`${y}`]: halfWidth
        };

        return (
          <g
            className="tick"
            key={`tick-${idx}`}
            opacity={1}
            transform={tickTransformer(v)}
          >
            <line {...lineProps} />
            <text {...textProps}>{format(v)}</text>
          </g>
        );
      })}
    </g>
  );
};
function translateX(scale: Scale, d: number) {
  return `translate(${scale(d)},0)`;
}
function translateY(scale: Scale, d: number) {
  return `translate(0,${scale(d)})`;
}
