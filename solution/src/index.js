import React from 'react';
import ReactDOM from 'react-dom';
import Moment from 'moment';
import * as d3 from 'd3';
import './index.css';

// Function that draws a table with the values.
function RowData(props) {
    return (
      <div className={((props.data.cnt + 2) % 2 === 0) ? 'row1' : 'row2'}>
      <tr id={props.data.id}>
        <td className="col1">{props.data.datetime}</td>
        <td className="col2">
          <input className="values" type="number" name="val1" id={props.data.id} value={props.data.value1} onChange={props.onChange} />
        </td>
        <td className="col3">
          <input className="values" type="number" name="val2" id={props.data.id} value={props.data.value2} onChange={props.onChange} />
        </td>
      </tr>
      </div>
    );
}

// Function that draws the comboBox.
function DateCbBx(props) {
  return (
    <select className="time" name="tiempo" value={props.value} onChange={props.onChange} autoFocus>
    <option value="1">Last hour</option>
    <option value="3">Last 3 hours</option>
    <option value="6">Last 6 hours</option>
    <option value="12">Last 12 hours</option>
    </select>
  );
}

class RestFAPI extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Vars of request.
      action: 'get',
      stateResult: 0,
      message: '',
      // Vars of information about the response.
      quantity: 0,
      old: 1, // 1 is the default value.
      rangeTime: '',
      // Vars of control of data.
        // Limits of the y axis.
      minValY: 0,
      maxValY: 0,
        // Info to show in the table.
      dataGraph: [],
        // Info to show in the graph.
      valsY1: [],
      valsY2: [],
        // Info to show in the x axis on the graph.
      dates: []
    };
   }

  componentWillMount() {
    // Get the data from the server.
    this.getDataFromSrvr(this.state.old);
  }

  // Handle the selected item on the comboBox.
  handleSelected(sender) {
    // Get the data from the server.
    this.getDataFromSrvr(sender.target.value);
  }

  // Function that returns the parameters for the request (start and end datetime).
  getParametersURL(hours) {
    let moment = new Moment();
    let parUrl = '';
    parUrl = "&end=" + moment.format().substring(0, 19) + "&";
    parUrl = "start=" + moment.subtract(hours, 'hours').format().substring(0, 19) + parUrl;
    return parUrl;
  }

  // Gets the maximum and minimum value of all data.
  getMaxMin() {
    let auxMin = 0, auxMax = 0;
    this.state.valsY1.forEach((e) => {
      auxMin = (auxMin < e.y) ? auxMin : e.y;
      auxMax = (auxMax > e.y) ? auxMax : e.y;
    });
    this.state.valsY2.forEach((e) => {
      auxMin = (auxMin < e.y) ? auxMin : e.y;
      auxMax = (auxMax > e.y) ? auxMax : e.y;
    });
    this.setState({
      minValY: auxMin,
      maxValY: auxMax
    });
  }

  // Function that gets the data from the server.
  getDataFromSrvr(qtyObjs) {
    this.setState({
      action: 'get',
      stateResult: 0,
      quantity: 0,
      old: qtyObjs,
      rangeTime: '',
      minValY: 0,
      maxValY: 0,
      dataGraph: [],
      valsY1: [],
      valsY2: [],
      dates: []
    });
    let auxRangeT = '';
    let params = 'http://localhost:8080/reading/?' + this.getParametersURL(qtyObjs); // Create the url to make the data request.
    fetch(params)
      .then((result) => {
        this.setState({
          stateResult: result.status,
          message: result.statusText,
          quantity: -1
        });
        return result.json();
      })
      .then((response) => {
        let iCnt = 0;
        response.forEach((data) => {
          // Create an object with the current data.
          let info = {
            cnt: iCnt,
            key: data.id,
            datetime: data.timestamp,
            value1: data.value1,
            value2: data.value2
          }
          if (iCnt === 0) {
            this.setState({
              rangeTime: new Moment(info.datetime).format("hh:mm") + ' - '
            });
          }
          // Create two objects with the values to show in the graph.
          let v1 = { y: info.value1 };
          let v2 = { y: info.value2 };
          this.setState({
            dataGraph: this.state.dataGraph.concat([info]),
            quantity: iCnt + 1,
            valsY1: this.state.valsY1.concat([v1]),
            valsY2: this.state.valsY2.concat([v2]),
            dates: this.state.dates.concat([new Moment(info.datetime).format("hh:mm")])
          });
          auxRangeT = new Moment(info.datetime).format("hh:mm");
          iCnt++;
        });
        this.getMaxMin();
        // Verifies if is necessary or not to draw the graph.
        if (this.state.stateResult === 200 && this.state.quantity > 0) {
          this.setState({
            rangeTime: this.state.rangeTime + auxRangeT
          });
          this.paintGraph();
        } else {
          this.setState({ quantity: 0 });
        }
      })
      .catch((ex) => {
        console.log(ex);
      })
  }

  // Handle the value changes on the textboxes.
  handleChange(sender, id) {
    let toUpdate = this.state.dataGraph;  // Obtains the array with the current data.
    let valueArr = [];  // Variable to get the array of the value to update it.
    // Verify if the value to update is on the first or second array.
    if (sender.target.name === 'val1') {
      toUpdate[id].value1 = sender.target.value;
      valueArr = this.state.valsY1;
      valueArr[id] = { y: sender.target.value };
      this.setState({valsY1: valueArr });
    } else if (sender.target.name === 'val2') {
      toUpdate[id].value2 = sender.target.value;
      valueArr = this.state.valsY2;
      valueArr[id] = { y: sender.target.value };
      this.setState({valsY2: valueArr });
    }
    // Calls the function to get the maximum and minimum value.
    this.getMaxMin();
    // Does the request to update the value on the server.
    fetch('http://localhost:8080/reading/', {
      id: 'updateReading',
      name: 'put',
      request: JSON.stringify({
        id: toUpdate[id].key,
        timestamp: toUpdate[id].datetime,
        value1: toUpdate[id].value1,
        value2: toUpdate[id].value2
      })
    })
    .then((result) => {
      this.setState({
        stateResult: result.status,
        message: result.statusText,
        dataGraph: toUpdate,
        action: 'put'
      });
      this.paintGraph();
    })
  }

  // Function that draws the graph.
  paintGraph() {
    //Get values from the "state".
    let datosX = this.state.dataGraph.length;
    let max = Number(this.state.maxValY) + 2;
    max = (max < 0) ? 0 : max;  //
    let min = Number(this.state.minValY) - 2;
    min = (min > 0) ? 0 : min; //
    let labelTime = '(' + this.state.rangeTime + ')';
    let labetValues =  '(' + Math.round(min) + ' - ' + Math.round(max) + ')';
    let dataset1 = this.state.valsY1;
    let dataset2 = this.state.valsY2;
    let dataset = [dataset1, dataset2];
    let dtaDate = this.state.dates;

    // Clear the previous content.
    d3.select("g").remove("g");
    // Vars.
    let svg = d3.select("svg"),
      margin = {top: 50, left: 50, bottom: 50, right: 50},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
    // Scale of axis X.
    // Set the range of the values to the axis X.
    let xData = d3.scaleQuantize()
      .domain([0, datosX-1])
      .range(dtaDate);
    // Set the scale of the range of values.
    let xRange = d3.scalePoint()
      .domain(xData.range())
      .range([0, width]);
    // Axis X.
    let xScale = d3.scaleLinear()
      .domain([0, datosX-1]) // input
      .range([0, width]); // output
    // Axis Y.
    let yScale = d3.scaleLinear()
      .domain([min, max]) // input
      .range([height, 0]); // output
    // Add the workspace.
    let g = svg.append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    // Add a label to the axis x.
    g.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", svg.attr("height") - 65)
      .text("Time " + labelTime);
    // Add a label to the axis y.
    g.append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", -25)
      .attr("transform", "rotate(-90)")
      .text("Values " + labetValues);
    // Add the axix x(range) to the bottom of the graph.
    g.append("g")
      .attr("transform", "translate(0, " + height + ")")
      .call(d3.axisBottom(xRange));
    // Add the axis y to the workspace.
    g.append("g")
      .call(d3.axisLeft(yScale));
    // Add the axis x(quantity) to the workspace.
    g.append("g")
      .attr("class", "axis-linear")
      .attr("transform", "translate(0, " + yScale(0) + ")")
      .call(d3.axisBottom(xScale));
    // Create the line object.
    let line = d3.line()
      .x((d, i) => { return xScale(i); })
      .y((d) => { return yScale(d.y); })
      .curve(d3.curveMonotoneX);
    // Add the paths.
    g.append("g").selectAll("path")
      .data(dataset)
    .enter().append("path")
      .attr("class", "line")
      .attr("stroke", (d, i) => { return ["#b73535", "#3546b7"][i]; })
      .attr("d", line)//;
    // Add circles to the data array 1.
    g.append("g").selectAll(".dot")
      .data(dataset1)
    .enter().append("circle")
      .attr("class", "dot1")
      .attr("cx", (d, i) => { return xScale(i); })
      .attr("cy", (d) => { return yScale(d.y); })
      .attr("r", 3);
    // Add circles to the data array 2.
    g.append("g").selectAll(".dot")
      .data(dataset2)
    .enter().append("circle")
      .attr("class", "dot2")
      .attr("cx", (d, i) => { return xScale(i); })
      .attr("cy", (d) => { return yScale(d.y); })
      .attr("r", 3);
  }

  render() {
    if (this.state.stateResult === 200) {
      if (this.state.quantity > 0) {
        return (
          <div>
            <div>
              <DateCbBx qty={this.state.old} value={this.state.old} onChange={(e) => this.handleSelected(e)} />
            </div>
            <div>
              <svg width="960" height="480"></svg>
            </div>
            <div>
              <table className="table-data" name="data" >
                <tbody>
                  <thead>
                    <div className="rowH">
                      <tr>
                        <th className="col1">Date/Time</th>
                        <th className="col2">Value 1</th>
                        <th className="col3">Value 2</th>
                      </tr>
                    </div>
                  </thead>
                  <tbody>
                    {
                      this.state.dataGraph.map((fila) => {
                        return (
                          <RowData key={fila.key} data={fila} onChange={(e) => this.handleChange(e, fila.cnt)} />
                        );
                      })
                    }
                  </tbody>
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if(this.state.quantity === -1) {
        return (
          <div>
            <p className="data-updating">
              Loading data...
            </p>
          </div>
        );
      } else {
        return (
          <div>
            <DateCbBx qty={this.state.old} value={this.state.old} onChange={(e) => this.handleSelected(e)} />
            <p className="no-data-found">
              No data was obtained, please select another option.
            </p>
          </div>
        );
      }
    } else if (this.state.stateResult === 500) {
      return (
        <div>
          <p className="server-error">
            It was not possible to make the request, please try again.
          </p>
        </div>
      );
    } else if (this.state.stateResult === 400) {
      if (this.state.action === 'get') {
        return (
          <div>
            <p className="server-error">
              An error occurred when requesting the information, please verify the format of the date, it must be in ISO8601 format * without * time zone.
            </p>
          </div>
        );
      } else if (this.state.action === 'put') {
        return (
          <div>
            <p className="server-error">
              The request made, could not be found. Please try again.
            </p>
          </div>
        );
      }
    } else if (this.state.stateResult === 0) {
      return (
        <div>
          <p className="data-updating">
            Loading data...
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <p className="server-error">
            It has not been possible to make the request to the server, code: {this.state.stateResult}.
          <br />
            The message returned by the server is: "{this.state.message}".
          </p>
        </div>
      );
    }
  }

}

// ========================================

ReactDOM.render(
  <RestFAPI />,
  document.getElementById('root')
);

// ========================================
