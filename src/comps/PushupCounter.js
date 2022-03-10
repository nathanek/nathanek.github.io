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
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
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
        allGraphData: [],
        graphDataLoaded: null,
        user: auth,
        displayNames:{},
        userData: {},
        date: new Date(),
        completed : 0,
        inputValue: 0,
        graphData: [],
        totalPushups: 0
    };  
  }

  componentDidMount() {
    registerLocale('en-AU', enAU);
    auth.onAuthStateChanged( (user) => {
      //console.log(JSON.stringify(user));
      if (user != null) {
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
                  this.getDataByDate()
                  const dataTrial = this.prepareDateForRecharts();
                  this.setState({totalPushups: this.totalPushupsCompleted()})
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
    this.setState({userData: tempJSON},() => this.submitData(this.state.userData))
    //this.prepareDateForRecharts();
    //console.log(this.state.userData);
};

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
    this.setState({date: addDays(this.state.date,val)},() => {this.getDataByDate();})
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
        }).map(key => {
            //console.log(key);
            return  <Line dataKey={key} type="monotone" stroke={"#" + Math.floor(Math.random()*16777215).toString(16)}
            type='natural' />
        });
        //console.log(jsxElements);
        this.setState({allGraphData: jsxElements});
        return jsxElements;
      }

    formatXAxis = (tickItem) => {
      return moment(tickItem).format('YYYY-MM-DD');
    }
    

  render() {
    return (
      <React.Fragment>
        <div className="main-grid-container">
          <h1>Day {this.calculateDay(this.state.date)}</h1>
          <div>
            <div className="grid-container">
              <div className="center-element">
                <button className="button-1" onClick={() => this.handleChange(new Date())}>Go to today</button>
              </div>
            </div>
            <div className="grid-container">
              <div className="leftArrowGrid">
                <button className="button-1"
                    onClick={() => this.incrementDate(-1)}>
                        <i class="arrow left"></i>
                </button>
              </div>
              <div className="datePicker input-1">
                <DatePicker className="input-1"
                    locale="en-AU" 
                    dateFormat="P"
                    selected={this.state.date} 
                    onChange={date => this.handleChange(date)} />
              </div>
              <div className="rightArrowGrid">
                <button className="button-1"
                    onClick={() => this.incrementDate(1)}>
                        <i class="arrow right"></i>
                </button>  
              </div>                
            </div>
            <div className="grid-container">
              <label className="grid-full-width">Pushups Completed Today</label>
              <div className="grid-full-width">
                <div className="quarter-parent-width">
                  <CircularProgressbar
                    value={this.state.completed} 
                    maxValue={this.calculateDay(this.state.date)} 
                    text={`${this.state.completed}/${this.calculateDay(this.state.date)}`} 
                  />
                </div>
              </div>
              <div className="leftArrowGrid">
              <button className="button-1"
                    onClick={() => this.incrementInputValue(-5)}>
                        -5
              </button>
              <button className="button-1"
                    onClick={() => this.incrementInputValue(-10)}>
                        -10
              </button>
                
              </div>
              <div className="number-input">
                <InputNumber className="input-1"
                  min={10} 
                  max={366} 
                  step={1} 
                  value={this.state.inputValue} 
                  onChange={evt => this.updateInputValue(evt)}
                />
              </div>
              <div className="rightArrowGrid">
                <button className="button-1"
                    onClick={() => this.incrementInputValue(5)}>
                        +5
                </button>
                <button className="button-1"
                    onClick={() => this.incrementInputValue(10)}>
                        +10
                </button>
              </div>
              <div className="center-element">
                <button  onClick={() => this.updateData()}  className="button-1">
                  Submit
                </button>
              </div>
              <div className="center-element">
                <button className="button-1"
                  onClick={() => this.handleFinishedClick()}>
                      Finished today!
                </button>
              </div>
            </div>
          </div>
          <div>
            <span>Graph of progress</span>
            <ResponsiveContainer width="80%" height={200}>
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
                <XAxis dataKey="date"  tickFormatter={this.formatXAxis} />
                {this.state.allGraphData}
                <YAxis />
                <Tooltip />
                <Legend />
              </LineChart>
            </ResponsiveContainer>  
          </div>
          <div>
            Pushups to date: {this.calculateDay(new Date())*(this.calculateDay(new Date())+1)/2}
          </div>
          <div>
            Pushups infront: {this.state.totalPushups-this.calculateDay(new Date())*(this.calculateDay(new Date())+1)/2}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PushupCounter;