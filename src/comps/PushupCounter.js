import '../styles.css';
import React from "react";
import {db, auth} from "../firebase/Database";
import { ref , child, get, set } from 'firebase/database';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import enAU from 'date-fns/locale/en-AU';
import { addDays } from 'date-fns/esm';
import InputNumber from 'react-input-number';

import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LabelList
  } from "recharts";
import moment from "moment";
import DateProcessing from "./DateProcessing";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class PushupCounter extends React.Component {

  constructor(props) {
    super(props);
    this.name= React.createRef();
    this.role= React.createRef();
    this.uid= React.createRef();
    
    this.handleChange = this.handleChange.bind(this);

    this.state = {
        lineData: "",
        dataLoaded: false,
        allGraphData: [],
        barGraphData: [],
        barGraphObjects: [],
        graphDataLoaded: null,
        user: auth,
        displayNames:{},
        userData: {},
        date: new Date(),
        completed : 0,
        inputValue: 0,
        graphData: [],
        totalPushups: 0,
        pushupTally: 0
    };  
  }

  componentDidMount() {
    registerLocale('en-AU', enAU);
    auth.onAuthStateChanged( (user) => {
      //console.log(JSON.stringify(user));
      if (user) {
        this.setState({ user: user},this.getUserData())
        this.getUserIds();
        //this.prepareDateForRecharts();
      } else {
        console.log('not logged in');
      }
    });
    //console.log(JSON.stringify(auth));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {    
      //this.writeUserData();
    }
  }



  addUser = (user_uid) => {
        //push(ref(db, 'members/'),"date","40");
        set(ref(db, 'members/' + user_uid), {
            "16-02-2022": "40",
        });
    console.log("DATA SAVED");
  };

    padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    formatDate(date) {
        return [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
        ].join('-');
    }

    getDataByDate = () => {
        //console.log(this.formatDate(this.state.date));
        if(this.state.userData.hasOwnProperty(this.formatDate(this.state.date))) {
            //console.log('successful')
            const formattedDate = this.formatDate(this.state.date)
            this.setState({completed: this.state.userData[formattedDate]})
        }
        else {this.setState({ completed:0});}
    }

    getUserData = () => {
        //console.log(this.state.user.currentUser.uid);
        
        get(child(ref(db),"/members/" + auth.currentUser.uid)).then((snapshot) => {
            if (snapshot.exists()) {
                this.setState({userData: snapshot.val()},()=>{
                  this.setState({dataLoaded: true});
                  this.getDataByDate();
                  const dataTrial = this.prepareDateForRecharts();
                  
                  //console.log(this.state.userData);
                });
              } else {
            console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    convertDateStringToDate(dateString){
        var dateParts = dateString.split("-");
        // month is 0-based, that's why we need dataParts[1] - 1
        var dateObject = new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]); 
        return(dateObject);
    }

    handleChange(date) {
        //console.log(date);
        this.setState({ date: date}, () => {
            this.getDataByDate();
            this.loopBarGraphData();
        });
    }
  handleSubmit = event => {
    event.preventDefault();
    let name = this.name;
    let role = this.role;
    let uid = this.uid;

    this.name = "";
    this.role = "";
    this.uid = "";
  };

  updateData = () => {
    //Get date
    //this.formatDate(this.state.date);
    //Get input value
    //this.state.inputValue
    //this.state.userData[this.formatDate(this.state.date)] = parseInt(this.state.completed) + parseInt(this.state.inputValue);
    this.getDataByDate();
    var tempJSON = this.state.userData;
    if (Object.keys(this.state.userData).length === 0) {
      console.log('length of userData is 0');
      new Promise((resolve, reject) => {
        get(child(ref(db),"/members/" + auth.currentUser.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          }
      }).catch((err) => {console.log(err)});
      }).then(() => {
        tempJSON = this.state.userData;
      }).catch((err) => {console.log(err)})
    } else {
      console.log('else');
      
    }
    tempJSON[this.formatDate(this.state.date)] = this.state.completed + this.state.inputValue;
    this.setState({userData: tempJSON},() => { 
      this.setState({totalPushups: this.totalPushupsCompleted()}, ()=>{
        this.setState({pushupTally: this.state.totalPushups-this.calculateDay(new Date())*(this.calculateDay(new Date())+1)/2}, ()=>{
          this.submitData(this.state.userData);  
        });
      })
    });
  }
    //this.prepareDateForRecharts();
    //console.log(this.state.userData);

  isNumeric(str) {
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail  
  }

  submitData = (data) => {
    set(ref(db, 'members/' + auth.currentUser.uid), data)
      .then(() => {this.getDataByDate()})
      .then(() =>{this.getUserIds()});
    console.log("JSON DATA SAVED");
};

updateInputValue(evt) {
    console.log(evt);
    const val = evt;
    // ...
    if (this.isNumeric(val)){
      this.setState({
        inputValue: val
      });
    } else {
      console.log('error: non-numeric value entered');
    }
  }

  incrementInputValue(val) {
    if (this.isNumeric(this.state.inputValue)){
      this.setState({inputValue: (this.state.inputValue + val)});
    } else {
      console.log('invalid input');
    }
  }

  incrementDate(val) {
    //console.log(this.state.date);
    //console.log(addDays(this.state.date,val));
    this.setState({date: addDays(this.state.date,val)},() => {
      this.getDataByDate();
      this.loopBarGraphData();
    })
  }

  calculateDay(date) {
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = date - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    //console.log('Day of year: ' + day);
    return (day);
  }

  totalPushupsCompleted() {
    const userData = this.state.userData
    var sum = 0;
    for( var el in userData ) {
        if( userData.hasOwnProperty( el ) ) {
        sum += parseFloat( userData[el] );
        }
    }
    return sum;
  }

  getUserIds () {
    get(child(ref(db),"/users/")).then((snapshot) => {
      if (snapshot.exists()) {
        //console.log(JSON.stringify(snapshot.val()));
        this.setState({displayNames: snapshot.val()},() => {this.prepareDateForRecharts()});
        //console.log(this.state.user);
        //console.log(this.state.displayNames);
      } else {
        console.log("No data available");
      }
      }).catch((error) => {
          console.error(error);
      });
  }

  handleFinishedClick() {
    new Promise ((res) => {
      this.incrementInputValue(this.calculateDay(this.state.date)-(+this.isNumeric(this.state.inputValue)*this.state.inputValue)-this.state.completed)
      return res();
    }).then(() => {this.updateData()})
  }
  
  prepareDateForRecharts() {
    get(child(ref(db),"/members/")).then((snapshot) => {
        if (snapshot.exists()) {
            //console.log(snapshot.val());
            const codes = Object.entries(snapshot.val())
            .map(([key, value]) => { 
              const userData = Object.entries(value).map(([key2,value2]) => {
                    return {date: this.convertDateStringToDate(key2), count: value2};
                })
                //console.log(JSON.stringify(userData));
                //console.log(key + ': ' + value);
                const graphData = DateProcessing(userData);
                //console.log(JSON.stringify(graphData));
                //console.log(JSON.stringify(this.state.displayNames));
                return {uid: this.state.displayNames[key]["displayName"], data: graphData}
            });
            //this.setState({graphData: codes});
            
            //console.log(JSON.stringify(codes));
            var tempJSON = new Array(codes[0].data[0].length);
            tempJSON = codes[0].data.map((s,index) => {
              return tempJSON[index] = {"date":s.date}
            });
            //console.log(JSON.stringify(tempJSON));
            var voidVar = codes.map((s,index) => {
              var uid = s.uid;
              //console.log(uid);
              //console.log(index);
              //console.log(JSON.stringify(s.data));
              var iterData = s.data.map((data,i) => {
                //console.log(data.date);
                //console.log(data.count);
                //console.log(i);
                //console.log(uid);
                //console.log(JSON.stringify(tempJSON[i]));
                tempJSON[i][uid] = data.count; 
                //console.log(tempJSON[i][uid]);
                return ;
              });
              //console.log(JSON.stringify(tempJSON));
              //jsonObj[s.uid] = s.data
              //return tempJSON[index].push({...jsonObj});
              return ;
            });
            //console.log(JSON.stringify(tempJSON));
            this.setState({ graphData: tempJSON},()=>{this.generateGraphData()});
        } else {
        console.log("No data available");
        }
        }).catch((error) => {
            console.error(error);
        });
        
    }

    generateGraphData() {
      new Promise((resolve, reject) => {
        //console.log("made it to this point");
        return resolve(this.loopGraphData());
      }).then((res) => {
        //console.log(res);
        //console.log("made it to this point");
        this.setState({lineData: res});
        this.setState({graphDataLoaded: true});
        this.loopBarGraphData()
        return ;
      }).catch((error) => {console.log(error);})
    }

    loopGraphData = () => {
      var gData = this.state.graphData;
        const jsxElements = (Object.keys(gData[0])).filter(header => {
          if (header === 'date') {
            return false;
          } else {
            return true;
          }
        }).map((key,index) => {
            //console.log(key);
            return  <Line dataKey={key} type="monotone" stroke={this.createBoldColourFromInteger(index)}
            dot={false} />
        });
        //console.log(jsxElements);
        this.setState({allGraphData: jsxElements});
        return jsxElements;
      }
      
      componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      
      rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
      }

      createBoldColourFromInteger(num){
        let a=0
        let b=0
        let c=0
        switch (num % 6){
          case 0:
            a = 255/(1+num/6)
            break;
          case 1:
            b = 255/(1+num/6)
            break;
          case 2:
            c = 255/(1+num/6)
            break;
          case 3:
            a = 255/(1+num/6)
            b = 255/(1+num/6)
            break;
          case 4:
            b = 255/(1+num/6)
            c = 255/(1+num/6)
            break;
          case 5:
            a = 255/(1+num/6)
            c = 255/(1+num/6)
            break;
            default:
              console.log("error")
        }
        console.log(a + " " + b + " " + c);
        console.log(this.rgbToHex(Math.round(a),Math.round(b),Math.round(c)));
        return (this.rgbToHex(Math.round(a),Math.round(b),Math.round(c)))
      }

      loopBarGraphData = () => {
        if (typeof this.state.graphData[this.calculateDay(this.state.date)-1]=== 'undefined') {
          //Do nothing
        } else {
          var gData = this.state.graphData.slice(this.calculateDay(this.state.date)-1,this.calculateDay(this.state.date));
          console.log(gData);
            const jsxElements = (Object.keys(gData)).map((key,index) => {
                console.log(key);
                gData[key].date = moment(gData[key].date).format('DD-MMM');
                return gData[key]
            });
            
            const barChartElements = (Object.keys(gData[0])).filter(header => {
              if (header === 'date') {
                return false;
              } else {
                return true;
              }
              }).map((key,index) => {
              return  <Bar isAnimationActive={false} dataKey={key} fill={this.createBoldColourFromInteger(index)} >
                        <LabelList dataKey={key} position="top" />
                      </Bar>
              });
              
            this.setState({barGraphObjects: barChartElements},
            () => {
              this.setState({barGraphData: jsxElements});
            });
            console.log(JSON.stringify(jsxElements));
            return jsxElements;
          }
        }

    formatXAxis = (tickItem) => {
      return moment(tickItem).format('YY-MM-DD');
    }
    
    finishedButton = () => {
      return(
        <button className="button-1"
          onClick={() => this.handleFinishedClick()}>
              Finished today!
        </button>
      );
    }

    submitButton = () => {
     return(  
      <button  onClick={() => this.updateData()}  className="button-1">
        Submit
      </button>
     );
    }

  render() {
    return (
      <React.Fragment>
        <div className="grid-container" >
          <h1 className="item-a">Day {this.calculateDay(this.state.date)}</h1>
          <div className="item-b">
            <button className="button-1" onClick={() => this.handleChange(new Date())}>Go to today</button>
          </div>
          <div className="item-c">
            <button className="button-1"
                onClick={() => this.incrementDate(-1)}>
                    <i class="arrow left"></i>
            </button>
          </div>
          <div className="item-d">
            <DatePicker className="input-1"
                locale="en-AU" 
                dateFormat="P"
                selected={this.state.date} 
                onChange={date => this.handleChange(date)} />
          </div>
          <div className="item-e">
            <button className="button-1"
                onClick={() => this.incrementDate(1)}>
                    <i class="arrow right"></i>
            </button>  
          </div>                
          <div className="item-f">
            <label className="grid-full-width" >Pushups Completed Today</label>
            <div className="grid-full-width">
              <div className="quarter-parent-width">
                <CircularProgressbar
                  value={this.state.completed} 
                  maxValue={this.calculateDay(this.state.date)} 
                  text={`${this.state.completed}/${this.calculateDay(this.state.date)}`} 
                />
              </div>
            </div>
          </div>
          <div className="item-g" grid-columns="">
            <button className="button-1"
                  onClick={() => this.incrementInputValue(-5)}>
                      -5
            </button>
          </div>
          <div className="item-h" grid-columns="">
            <button className="button-1"
                  onClick={() => this.incrementInputValue(-10)}>
                      -10
            </button>
          </div>
          <div className="item-i">
            <InputNumber className="input-1"
              min={10} 
              max={366} 
              step={1} 
              value={this.state.inputValue} 
              onChange={evt => this.updateInputValue(evt)}
            />
          </div>
          <div className="item-j">
            <button className="button-1"
                onClick={() => this.incrementInputValue(5)}>
                    +5
            </button>
          </div>
          <div className="item-k">
            <button className="button-1"
                onClick={() => this.incrementInputValue(10)}>
                    +10
            </button>
          </div>
          <div className="item-l">
            {this.state.dataLoaded && this.submitButton()}
          </div>
          <div className="item-m">
            {this.state.dataLoaded && this.finishedButton()}
          </div>
          <div className="item-n">
            <ResponsiveContainer>
              <BarChart data={this.state.barGraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date"/>
                <YAxis type="number" domain={[0, this.calculateDay(this.state.date)*1.5]}/>
                <Legend align="center" />
                {this.state.barGraphObjects}  
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="item-o">
            <span>Graph of progress</span>
              <ResponsiveContainer width="99%">
              <LineChart
                data = {this.state.graphData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
                >    
                <CartesianGrid strokeDasharray="3 3"/>
                <Legend layout="horizontal"/>
                <XAxis dataKey="date"  tickFormatter={this.formatXAxis} />
                {this.state.allGraphData}
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>  
          </div>
          <div className="item-p">
            <p>
              Pushups to date: {this.calculateDay(new Date())*(this.calculateDay(new Date())+1)/2} 
              <br></br>Pushups infront: {this.state.pushupTally}
            </p>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PushupCounter;