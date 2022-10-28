import './App.scss';
import { Component } from 'react';
import {evaluate, format} from 'mathjs';
import {isMobile} from 'react-device-detect';

const keyTable = {
  clear: {
    id: 'clear',
    value: 'C',
    key: [8, 46], //backspace, delete
    type: 'clear'
  },
  seven: {
    id: 'seven',
    value: '7',
    key: [103, 55],
    type: 'number'
  },
  eight: {
    id: 'eight',
    value: '8',
    key: [104, 56],
    type: 'number'
  },
  nine: {
    id: 'nine',
    value: '9',
    key: [105, 57],
    type: 'number'
  },
  divide: {
    id: 'divide',
    value: '÷',
    key: [111, 191],
    type: 'operator',
    symbol: '/'
  },
  four: {
    id: 'four',
    value: '4',
    key: [100, 52],
    type: 'number'
  },
  five: {
    id: 'five',
    value: '5',
    key: [101, 53],
    type: 'number'
  },
  six: {
    id: 'six',
    value: '6',
    key: [102, 54],
    type: 'number'
  },
  multiply: {
    id: 'multiply',
    value: '×',
    key: [106, 56], //with shift
    type: 'operator',
    symbol: '*'
  },
  one: {
    id: 'one',
    value: '1',
    key: [97, 49],
    type: 'number'
  },
  two: {
    id: 'two',
    value: '2',
    key: [98, 50],
    type: 'number'
  },
  three: {
    id: 'three',
    value: '3',
    key: [99, 51],
    type: 'number'
  },
  subtract: {
    id: 'subtract',
    value: '-',
    key: [109, 189],
    type: 'operator',
    symbol: '-'
  },
  zero: {
    id: 'zero',
    value: '0',
    key: [96, 48],
    type: 'number'
  },
  decimal: {
    id: 'decimal',
    value: '.',
    key: [110, 190],
    type: "decimal"
  },
  equals: {
    id: 'equals',
    value: '=',
    key: [13, 32],
    type: 'equal'
  },
  add: {
    id: 'add',
    value: '+',
    key: [107, 187], //with shift
    type: 'operator',
    symbol: '+'
  }
}

const keypad = [...(Object.values(keyTable).map(x => x))
.map(y => y['key'])].join().split(',');

const keyCodeArr = keypad.map(x => parseInt(x));


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      displayValue: '0',
      flgDecimal: false,
      toEquateArr: [],
      operatorClicked: false,
      flgNegative: false,
      flgEquated: false
    };
    this.createBtn = this.createBtn.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  createBtn(){
    const returnArr = [];

    for(let i in keyTable){
      returnArr.push(
        <div className='col' key={i}>
          <a role="button" 
            className='keypad' 
            id={keyTable[i]['id']} 
            href="#" 
            key={keyTable[i]['value']}
            onClick={(e) => this.handleClick(e)}>
              {keyTable[i]['value']}
            </a>
        </div>
      );
    }
    return returnArr;
  }

  handleClick(e){
        
    const numbers = [...(Object.values(keyTable).filter(x => x['type'] === 'number'))
      .map(y => y['id'])];

    const operators = [...(Object.values(keyTable).filter(x => x['type'] === 'operator'))
    .map(y => y['id'])];

    let displayable = numbers.includes(e.target.id);

    // clear
    if(e.target.id === 'clear'){
      this.setState({
        displayValue: '0',
        flgDecimal: false,
        toEquateArr: [],
        operatorClicked: false,
        flgNegative: false,
        flgEquated: false
      });

    //decimal
    } else if (e.target.id === 'decimal' && this.state.flgDecimal === false) {
      this.setState({
        displayValue: this.state.displayValue.concat(e.target.innerText),
        flgDecimal: true
      });
    
    //equals
    } else if(e.target.id === 'equals' &&
              this.state.flgEquated === false &&
              this.state.toEquateArr.length !== 0 &&  //check if there is to compute
              this.state.operatorClicked === false) { //check if the operation is complete(ending with number)

      let numeralsArr = [...this.state.toEquateArr, this.state.displayValue];
      console.log(numeralsArr);
      let pemdas = evaluate(numeralsArr.join(' ')); //from MathJS
      let toDisplay = (num) => {return num > 999999999999999 
                                            ? format(num, {notation: 'exponential', precision: 3}) 
                                            : num}
      console.log(toDisplay(pemdas));


      this.setState({
        displayValue: toDisplay(pemdas).toString(),//pemdas.toString(),
        toEquateArr: [],
        operatorClicked: true,
        flgEquated: true,
        flgNegative: false
      });

    //numbers and operation
    }else {
      //numbers
      if(displayable){
        if(this.state.displayValue !== '0' && 
          this.state.operatorClicked === false){
            if(window.innerWidth > 519) {//laptop
              if(this.state.displayValue.length < 15){  //999999999999999
                this.setState({
                  displayValue: this.state.displayValue.concat(e.target.innerText),
                });
              }
            } else if(window.innerWidth > 379){ //phone
              if(this.state.displayValue.length < 11){  //999999999999999
                this.setState({
                  displayValue: this.state.displayValue.concat(e.target.innerText),
                });
              }  
            } else {
              if(this.state.displayValue.length < 9){  //999999999999999
                this.setState({
                  displayValue: this.state.displayValue.concat(e.target.innerText),
                });
              } 
            }
            
        } else {
          this.setState({
            displayValue: e.target.innerText,
            operatorClicked: false
          });
        }
        
      //operators  -----> (+ - / *) only
      } else if(operators.includes(e.target.id)) {
        let arrLen = this.state.toEquateArr.length;
        let operationalSymbol = keyTable[e.target.id]['symbol'];

        //first input of operator
        if(this.state.operatorClicked === false ||
            this.state.flgEquated === true){

          this.setState({
            toEquateArr: [...this.state.toEquateArr, this.state.displayValue, operationalSymbol],
            operatorClicked: true,
            flgDecimal: false,
            flgEquated: false
          });
          
        // operatorClicked === true
        } else {

          if(operationalSymbol !== '-'){
            let tempArr = [...this.state.toEquateArr];

            //if there is negation present in equation
            if(this.state.flgNegative === true){
              tempArr.splice(arrLen - 2, 2)
              console.log("flgNegative " + tempArr)
              this.setState({
                toEquateArr: [...tempArr, operationalSymbol],
                flgNegative: false
              });
            } else {
              if(this.state.toEquateArr[arrLen - 1] !== operationalSymbol){
                tempArr[arrLen - 1] = operationalSymbol;
                this.setState({
                  toEquateArr: [...tempArr],
                  flgNegative: false
                });
              }
            }

          //for negation
          } else { 
            let symbols = ['+', '-', '*', '/'];
            if(symbols.includes(this.state.toEquateArr[arrLen - 1]) &&
                this.state.flgNegative === false){
              this.setState({
                toEquateArr: [...this.state.toEquateArr, operationalSymbol],
                flgNegative: true
              });
            }
          }
        }
      }
    }
  }

  handleKeyPress(event) {
    //only valid key allowed
    if (keyCodeArr.includes(event.keyCode)){

      //8 or *
      if(event.keyCode === 56){
        //*(shift + 8)
        if(event.shiftKey){
          document.getElementById('multiply').click();
        //8
        } else {
          document.getElementById('eight').click();
        }

      //add symbol(shift + =)
      } else if(event.keyCode === 187 && event.shiftKey) {
        document.getElementById('add').click();

      //the rest of number except +(add symbol)
      } else {
        if(event.keyCode !== 187){
          const idFromKey = [...(Object.values(keyTable).filter(x => x['key'].includes(event.keyCode)))
                            .map(y => y['id'])].join();
          document.getElementById(idFromKey).click();
        }
      }
    }
  }

  render(){
    return (
      <div className="App">
        {/* <header className="App-header">
          <p>Calculator</p>
        </header> */}
        <div id="calc">
          <div id='brand'>
            <p>CASIO</p>
          </div>
          <div id="display">
            <p>{this.state.displayValue}</p>
          </div>
          <div id="digits" className='container'>
            {this.createBtn()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
