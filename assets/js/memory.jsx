import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'reactstrap';

export default function game_init(root, channel) {
  ReactDOM.render(<Demo channel={channel}/>, root);
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
		this.channel = props.channel;
    this.state = {
      memory_contents: [],
      is_answered: [],
      answers: [],
      waiting: false,
      click: 0
    };
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
    this.channel.on("flip back", this.gotView.bind(this))
    }

  gotView(view) {
    console.log("New view", view);
    this.setState(view.game);
  }

  restart() {
    this.channel.push("restart", {})
      .receive("ok", this.gotView.bind(this));
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

  setAnswered(ev) {
    if(!this.state.waiting){
      this.state.waiting = true;
      this.channel.push("set", { clickID: parseInt(ev.target.id) })
        .receive("ok", this.gotView.bind(this));
    }
  }
}

function Restart(params) {
  let root = params.root;
  return(
    <div className="rightBtn">
      <button onClick={params.click}>Restart</button>
    </div>
  );
}

function Score(params) {
  let root = params.root;
  return(
    <div className="container">
      <span className="col-3">Score: {100 - root.state.click}</span>
      <span className="col-3">Click: {root.state.click}</span>
    </div>
  );
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

    return (
      <div className="container">
        {contents}
      </div>
  );
}
