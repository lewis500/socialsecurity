// @flow
import React, { PureComponent } from "react";
import style from "./styleTooltip.scss";
import { format } from "d3-format";
const formatter = format("$,d");
const formatter2 = format("d");
// const Content = ({ params }) => {
export default class Tooltip extends PureComponent {
  render() {
    let { left, top, active, year, earnings } = this.props;
    return (
      <div
        className={style.tooltip}
        style={{ left, top, visibility: active ? "visible" : "hidden" }}
      >
        <div className={style.content}>
          earnings: {formatter(earnings)}
          <br />
          year: {formatter2(year)}
        </div>
      </div>
    );
  }
}
