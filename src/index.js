import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import { interpret } from "xstate";
import ticTacToeMachine from "./machine";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}


class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  state = {
    current: ticTacToeMachine.initialState
  };

  service = interpret(ticTacToeMachine).onTransition(current => {
    console.log({ current })
    this.setState({ current });
  });

  componentDidMount() {
    this.service.start();
  }

  componentWillUnmount() {
    this.service.stop();
  }

  handleClick(value) {
    const { send } = this.service;
    send("PLAY", { value });
  }

  startOver() {
    const { send } = this.service;
    send("STARTOVER");
  }

  render() {
    const { current } = this.state;

    const squares = current.context.squares;
    const status = current.context.status;
    const allowStartOver = !current.nextEvents.includes("STARTOVER");
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={squares}
            onClick={(value) => this.handleClick(value)} />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <button disabled={allowStartOver} onClick={() => this.startOver()}>New Game</button>
        </div>
      </div>
    );
  }
}



// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById("root")
);
