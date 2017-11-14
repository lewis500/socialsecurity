// @flow
import React, { Component, PureComponent } from "react";
import style from "./styleApp.scss";
import PIA from "components/PIA";
import type { RawDatum, Dot, Datum } from "types";
import { format } from "d3-format";
import moize from "moize";
import { scaleLinear } from "d3-scale";
import poster from "./poster2.jpg";
import demonstration from "./demonstration.gif";
import Plot from "components/Plot";
import Tooltip from "components/Tooltip";
import createHistory from "history/createBrowserHistory";
type Props = {
  rawData: Array<RawDatum>
};

const history = createHistory();

const calculateAIE = (data: Array<Datum>): number =>
  data.reduce(
    (a, datum) => a + (datum.counted ? datum.earningsAdjusted : 0),
    0
  ) / 35;

const makeDot = (id: string, year: number, earnings: number): Dot => ({
  id,
  year,
  earnings
});

const getData = moize.maxSize(
  1
)((dots: Array<Dot>, data: Array<RawDatum>): Array<Datum> => {
  const scale = scaleLinear()
    .domain(dots.map(d => d.year))
    .range(dots.map(d => d.earnings))
    .interpolate((a, b) => d => a * Math.pow(b / a, d));
  return data
    .map(d => {
      let earnings = scale(d.year),
        earningsCapped = Math.min(d.cap, earnings),
        earningsAdjusted = earningsCapped * d.index;
      return {
        ...d,
        earnings,
        earningsCapped,
        earningsAdjusted
      };
    })
    .sort((a, b) => b.earningsAdjusted - a.earningsAdjusted)
    .map((d, i) => ({ ...d, counted: i < 35 }))
    .sort((a, b) => a.year - b.year);
});

const Divider = () => <div className={style.divider} />;

const Labels = ({ step }: { step: number }) => (
  <div className={style.lineLabels}>
    <div>
      <div
        className={style.earningsLabel + " " + (step > 1 ? style.light : "")}
      />
      <div> earnings</div>
    </div>
    {step <= 4 && (
      <div>
        <div className={style.awiLabel} />
        <div>Average Wage Index</div>
      </div>
    )}
    {step >= 2 &&
      step < 5 && (
        <div>
          <div className={style.capLabel} />
          <div>cap</div>
        </div>
      )}
    {step === 2 && (
      <div>
        <div className={style.earningsCappedLabel} />
        <div>taxed earnings</div>
      </div>
    )}
    {step === 3 && (
      <div>
        <div className={style.earningsAdjustedLabel} />
        <div>indexed+taxed earnings</div>
      </div>
    )}
    {step >= 4 && (
      <div>
        <div className={style.earningsAdjustedLabel} />
        <div>indexed+taxed+counted earnings</div>
      </div>
    )}

    {step >= 5 && (
      <div>
        <div className={style.AIELabel} />
        <div>avg. indexed earnings</div>
      </div>
    )}
  </div>
);

const ProgressBar = ({ step }: { step: number }) => (
  <div className={style.progress}>
    <div className={style.title}>
      <span>{step}</span>/7
    </div>
    <div className={style.container}>
      <div className={style.filled} style={{ width: `${step / 7 * 100}%` }} />
    </div>
  </div>
);

type TextProps = { step: number, AIE: number, maxEarnings: number };
const Text = ({ step, AIE, maxEarnings }: TextProps) => (
  <div className={style.textContainerOuter}>
    <div
      className={style.textContainer}
      style={{ transform: `translateX(${-100 / 7 * (step - 1)}%)` }}
    >
      <div className={style.text}>
        <div className={style.textTitle}>Set earnings</div>
        <p>
          Benefits depend on lifetime <em>earnings</em>&mdash;income from
          working (not profits, inheritance, etc). To chart lifetime earnings,
          click the chart to make draggable dots (double click to delete). The {" "}
          National&nbsp;
          <a href="https://www.ssa.gov/oact/cola/awidevelop.html">
            Average Wage Index
          </a>{" "}
          should help you be realistic.
        </p>
        {step <= 2 && (
          <div className={style.demonstration}>
            <img src={demonstration} height="100%" />
          </div>
        )}
      </div>

      <div className={style.text}>
        <div className={style.textTitle}>Cap earnings</div>
        <p>
          Workers and employers only pay Social Security tax (6.2% each today)
          on earnings up to a{" "}
          <a href="https://www.ssa.gov/planners/maxtax.html">cap</a>&nbsp; set
          by the Social Security Administration each year. Only these&nbsp;
          <em>taxed</em> earnings count toward retirement benefits.
        </p>
      </div>

      <div className={style.text}>
        <div className={style.textTitle}>Indexing</div>
        <p>
          Next, we adjust taxed earnings for changes in the standard-of-living,
          by multiplying them by an index factor tied to the Average Wage Index.
          For example, since average earnings were only half as much in 1994 as
          in 2016, earnings from 1994 count twice as much.
        </p>
      </div>

      <div className={style.text}>
        <div className={style.textTitle}>Top 35 years</div>
        <p>
          We count only the top 35 years of your indexed, taxed earnings.
          Missing years are zeros.
        </p>
      </div>

      <div className={style.text}>
        <div className={style.textTitle}>Average</div>
        <p>
          We average the top 35 years of indexed, taxed earnings to get your
          average indexed earnings.
        </p>
      </div>
      <div className={style.text + " " + style.PIA}>
        <div className={style.textTitle}>Derive benefit</div>
        <p>
          Finally, we use &nbsp;
          <a href="https://www.ssa.gov/oact/cola/piaformula.html">
            the formula below
          </a>{" "}
          to derive the annual benefit, which arrives in monthly installments
          and gets adjusted for inflation after retirement.
        </p>
        {step >= 6 && <PIA AIE={AIE} maxEarnings={maxEarnings} />}
      </div>
      <div className={style.text + " " + style.notes}>
        <div className={style.textTitle}>Notes</div>
        <p>
          This is not a financial planning tool, only a demonstration. The
          Social Security Administration{" "}
          <a href="https://www.ssa.gov/planners/benefitcalculators.html">
            {" "}
            provides more accurate calculators.
          </a>
        </p>
        <p>
          Check out this&nbsp;
          <a href="http://budgetmodel.wharton.upenn.edu/social-security/">
            simulator
          </a>
          &nbsp; where you make hard choices to keep Social Security solvent.
        </p>
        <p>
          Social Security does more than retirement; it sustains disabled people
          and the families of workers who have died.
        </p>
        <p>Built w/ Webpack, d3, React, SASS & Flowtype.</p>
      </div>
    </div>
  </div>
);

const Social = () => (
  <div className={style.social}>
    <div className={style.tweet}>
      <a
        href="https://twitter.com/share?ref_src=twsrc%5Etfw"
        className="twitter-share-button"
        data-text="Social Security Retirement Benefits Explained Visually"
        data-url="http://lewis500.github.io/socialsecurity"
        data-via="LewisLehe"
        data-show-count="false"
      >
        Tweet
      </a>
    </div>
    <div>
      <a
        className="github-button"
        href="https://github.com/lewis500/socialsecurity"
        data-icon="octicon-star"
        aria-label="Star lewis500/socialSecurity on GitHub"
      >
        Star
      </a>
    </div>
  </div>
);

export default class App extends Component {
  props: Props;
  yDomain: [number, number];
  xDomain: [number, number];
  state: {
    dots: Array<Dot>,
    step: number,
    tooltip: {
      left: number,
      top: number,
      active: boolean,
      earnings: number,
      year: number
    }
  };

  constructor(props: Props) {
    super(props);
    const a = props.rawData[0];
    const b = props.rawData[props.rawData.length - 1];
    var url = new URLSearchParams(history.location.search);
    let step: number = +url.get("step") || 0;
    let dots = JSON.parse(url.get("dots")) || [
      makeDot("a", a.year, a.cap / 2),
      makeDot("d", 1985, 70000),
      makeDot("e", 1992, 90000),
      makeDot("b", b.year, b.cap / 2)
    ];
    this.state = {
      dots,
      step,
      tooltip: {
        active: false,
        earnings: 0,
        year: 0,
        left: 0,
        top: 0
      }
    };

    this.yDomain = [0, b.cap * 1.05];
    this.xDomain = [a.year, b.year];
  }

  forward = () => {
    this.setState(
      ({ step }) => ({
        step: Math.min(step + 1, 7)
      }),
      () => {
        history.push({
          search: `?step=${this.state.step}&dots=${JSON.stringify(
            this.state.dots
          )}`
          // search: `?step=${this.state.step}`
        });
      }
    );
  };

  backward = () => {
    this.setState(
      ({ step }) => ({
        step: Math.max(step - 1, 0)
      }),
      () => {
        history.push({
          search: `?step=${this.state.step}&dots=${JSON.stringify(
            this.state.dots
          )}`
          // search: `?step=${this.state.step}`
        });
      }
    );
  };

  addDot = (id: string, year: number, earnings: number) => {
    this.setState(({ dots }) => ({
      dots: dots
        .concat(makeDot(id, year, earnings))
        .sort((a, b) => a.year - b.year)
    }));
  };

  updateDot = (id: string, year: number, earnings: number) => {
    let newDot = makeDot(id, year, earnings);
    this.setState(({ dots }) => ({
      dots: dots
        .map(d => (d.id === id ? newDot : d))
        .sort((a, b) => a.year - b.year)
    }));
  };

  storeHistory = () => {
    history.replace({
      search: `?step=${this.state.step}&dots=${JSON.stringify(this.state.dots)}`
    });
  };

  deleteDot = (id: string) => {
    if (this.state.dots.length <= 2) return;
    this.setState(({ dots }) => ({
      dots: dots.filter(d => d.id !== id).sort((a, b) => a.year - b.year)
    }));
  };

  updateTooltip = (
    left: number,
    top: number,
    year: number,
    earnings: number
  ) => {
    this.setState({
      tooltip: { active: true, left, top, earnings, year }
    });
  };

  closeTooltip = () => {
    this.setState(({ tooltip }) => ({
      tooltip: {
        ...tooltip,
        active: false
      }
    }));
  };

  componentDidMount() {
    window.addEventListener("keydown", this.onKeyDown);
    this.storeHistory();
    // history.replace({
    //   // search: `?step=${this.state.step}&dots=${JSON.stringify(
    //   //   this.state.dots
    //   // )}`
    //   search: `?step=${this.state.step}`
    // });
    this.unlisten = history.listen((location, action) => {
      var url = new URLSearchParams(location.search);
      var c = +url.get("step");
      if (c !== this.state.step)
        this.setState({
          step: c
        });
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") this.forward();
    else if (e.key === "ArrowLeft") this.backward();
  };

  render() {
    const { step, dots } = this.state;
    const data = getData(dots, this.props.rawData);
    const AIE = calculateAIE(data);

    return (
      <div className={style.main + " " + (step === 0 ? " " : style.shifted)}>
        <div className={style.landing}>
          <Social />
          <div className={style.image}>
            <img className={style.poster} src={poster} />
          </div>
          <div className={style.right}>
            <div className={style.inner}>
              <div className={style.name}>
                by &nbsp;
                <a href="http://lewislehe.com" _target="blank">
                  Lewis Lehe
                </a>
                &nbsp; and &nbsp;
                <a href="http://dennyshess.ch" _target="blank">
                  Dennys Hess
                </a>
              </div>
              <Divider />
              <div className={style.title}>
                Social Security<br />
                retirement benefits<br />
                explained visually
              </div>
              <div className={style.intro}>
                <Divider />
                <p>
                  In 2017, the US Social Security ystem will pay $955 billion in
                  benefits. For most retirees, these payments account for{" "}
                  <a href="https://www.ssa.gov/policy/docs/chartbooks/fast_facts/2017/fast_facts17.pdf">
                    more than 50% of income
                  </a>, but few people know how they're calculated. This
                  visualization calculates the baseline annual benefit of
                  someone retiring in 2017 at the&nbsp;
                  <a href="https://www.ssa.gov/planners/retire/retirechart.html">
                    full retirement age
                  </a>&nbsp; (between 66 and 67). In real life, the system
                  is&nbsp;
                  <a href="https://www.ssa.gov/policy/docs/ssb/v75n3/v75n3p1.html">
                    more complex in many ways
                  </a>, but we'll give you a basic idea. Use left/right arrow
                  keys to navigate.
                </p>
                <Divider />
                <div className={style.getStarted} onClick={this.forward}>
                  Let's go! &nbsp; <i className="fa fa-long-arrow-right" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.content}>
          <Social />
          <Tooltip {...this.state.tooltip} />
          <div className={style.chart}>
            <Plot
              dots={dots}
              step={step}
              AIE={AIE}
              storeHistory={this.storeHistory}
              addDot={this.addDot}
              updateDot={this.updateDot}
              deleteDot={this.deleteDot}
              yDomain={this.yDomain}
              xDomain={this.xDomain}
              data={data}
              updateTooltip={this.updateTooltip}
              closeTooltip={this.closeTooltip}
            />
            <Labels step={step} />
          </div>
          <div className={style.sidebar}>
            <ProgressBar step={step} />
            <Text step={step} AIE={AIE} maxEarnings={this.yDomain[1]} />
            <div className={style.buttons}>
              <div className={style.button} onClick={this.backward}>
                <i className="fa fa-long-arrow-left" /> &nbsp; Previous Step
              </div>
              <div
                className={
                  style.button + " " + (step === 7 ? style.hidden : "")
                }
                onClick={this.forward}
              >
                Next Step &nbsp; <i className="fa fa-long-arrow-right" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
