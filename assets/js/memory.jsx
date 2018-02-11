import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'reactstrap';

export default function run_demo(root) {
    ReactDOM.render(<Demo/>, root);
}

/*
* state for Demo:
* {
*   memory_contents: String[16]  // 4*4 grids's content
*   is_answered: Boolean[16] // if it has been found
*   answers: Int[2] // maybe not full filled to
*   waiting: Boolean // waiting 1 seconds, not respond
*   click: Int // the time player clicks, less click higher score.
* }
* */

class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memory_contents: this.getShuffleArray(),
            is_answered: this.getIsAnswered(),
            answers: [],
            waiting: false,
            click: 0
        };
    }

    // restart the whole game.
    // Give a new random game.
    restart() {
        let new_state = {
            memory_contents: this.getShuffleArray(),
            is_answered: this.getIsAnswered(),
            answers: [],
            waiting: false,
            click: 0
        };
        this.setState(new_state);
    }

    // change the state after clicking.
    setAnswered(ev) {
        let n = parseInt(ev.target.id);
        if ((!this.state.is_answered[n]) && (!this.state.waiting)) {
            // first click
            if (this.state.answers.length === 0) {
                this.state.click += 1;
                this.state.answers.push(n);
                this.setState(this.state);
            }
            else {
                // cant be the same input
                let n2 = this.state.answers[0];
                if (!(n2 === n)) {
                    // check the second click
                    // and then answers will be [] again.
                    this.state.click += 1;
                    let letter1 = this.state.memory_contents[n2];
                    let letter2 = this.state.memory_contents[n];
                    if (letter1 === letter2) {
                        // get a pair
                        this.state.answers.push(n);
                        this.state.waiting = true;
                        this.setState(this.state);
                        setTimeout(() => {
                            this.state.is_answered[n2] = true;
                            this.state.is_answered[n] = true;
                            this.state.waiting = false;
                            this.state.answers = [];
                            this.setState(this.state);
                        }, 800);
                    }
                    else {
                        this.state.answers.push(n);
                        this.state.waiting = true;
                        this.setState(this.state);
                        setTimeout(() => {
                            this.state.waiting = false;
                            this.state.answers = [];
                            this.setState(this.state);
                        }, 1000);
                    }
                }
            }
        }
    }

    // give a start is_answered array.
    getIsAnswered() {
        let a = [];
        for (let i = 0; i < 16; i++) {
            a.push(false);
        }
        return a;
    }

    // get shuffle idea from
    // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    getShuffleArray() {
        let myArray = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'];
        for (let i = myArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [myArray[i], myArray[j]] = [myArray[j], myArray[i]];
        }
        return myArray;
    }

    render() {
        return (
            <div>
                <Score root={this}/>
                <Board root={this} click={this.setAnswered.bind(this)}/>
                <Restart root={this} click={this.restart.bind(this)}/>
            </div>

        );
    }
}

function Restart(params) {
    let root = params.root;
    return <div className="rightBtn">
        <button onClick={params.click}>Restart</button>
    </div>
}

function Score(params) {
    let root = params.root;
    return <div className="container">
        <span className="col-3">Score: {100 - root.state.click}</span>
        <span className="col-3">Click: {root.state.click}</span>
    </div>
}

function Board(params) {
    let root = params.root;
    let array = root.state.memory_contents;
    let r1 = array.slice(0, 4);
    let r2 = array.slice(4, 8);
    let r3 = array.slice(8, 12);
    let r4 = array.slice(12);
    let board = [r1, r2, r3, r4];

    let contents = board.map((x, i) => (
        <div className="row" key={i + 10000}>
            {x.map((xx, ii) => {
                    let num = i * 4 + ii;
                    if (root.state.is_answered[num]) {
                        return <div className="col-3 answered" key={ii + 100} onClick={params.click} id={num}>
                        </div>
                    }
                    else {
                        let text = root.state.answers.includes(num) ? xx : "";
                        return <div className="col-3 notAnswered" key={ii + 100} onClick={params.click} id={num}>
                            {text}
                        </div>
                    }
                }
            )}
        </div>
    ));

    return <div className="container">
        {contents}
    </div>;
}

