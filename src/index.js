import "./index.css";

import { Machine, actions, assign, interpret } from "xstate";

import React from "react";
import ReactDOM from "react-dom";

const { log } = actions;

const play = (squares, position, value) => {
  const localSquares = [...squares];
  localSquares[position] = value;
  return localSquares;  
}

const ticTacToeMachine = Machine({
  id: "tictactoe",
  initial: "start",
  context: {
    squares: Array(9).fill(null),
    status: "Next player: X",
    winner: null
  },
  states: {
    start: {
      on: {
        // X plays first
        PLAY: {
          actions: assign({
            status: "Next player: O",
            squares: (ctx, event) => play(ctx.squares, event.value, "X")
          }),
          target: "oTurn"
        }
      }
    },
    xTurn: {
      on: {
        "": [
          {
            target: "gameOver",
            cond: "gameOverGuard"
          }
        ],
        PLAY: [{
          actions: assign({
            status: "Next player: O",
            squares: (ctx, event) => play(ctx.squares, event.value, "X")
          }),
          target: "oTurn",
          // Do not allow transitioning when a square is already occupied 
          cond: (ctx, event) => (ctx.squares[event.value]) === null
        },
        ],
      }
    },
    oTurn: {
      on: {
        "": [
          {
            target: "gameOver",
            cond: "gameOverGuard"
          }
        ],
        PLAY: [
          {
            actions: assign({
              status: "Next player: X",
              squares: (ctx, event) => play(ctx.squares, event.value, "O")
            }),
            target: "xTurn",
            // Do not allow transitioning when a square is already occupied
            cond: (ctx, event) => (ctx.squares[event.value]) === null
          },
        ],
      }
    },
    gameOver: {
      entry: log("Game Over!"),
      on: {
        "": [
          {
            target: "xWinner",
            cond: "xWins",
            actions: assign({
              status: "Winner: X",
              winner: "X"
            })
          },
          {
            target: "oWinner",
            cond: "oWins",
            actions: assign({
              status: "Winner: O",
              winner: "O"
            })
          },
          {
            target: "noWinner",
            cond: "noOneWins",
            actions: assign({
              status: "Winner: 😸",
              winner: "😸"
            })
          }
        ]
      }
    },
    xWinner: {
      entry: log("X wins!"),
      on: {
        STARTOVER: {
          actions: assign({
            squares: Array(9).fill(null),
            status: "Next player: X",
            winner: null
          }),
          target: "start"
        }
      }
    },
    oWinner: {
      entry: log("O wins!"),
      on: {
        STARTOVER: {
          actions: assign({
            squares: Array(9).fill(null),
            status: "Next player: X",
            winner: null
          }),
          target: "start"
        }
      }
    },
    noWinner: {
      entry: log("No one won"),
      on: {
        STARTOVER: {
          actions: assign({
            squares: Array(9).fill(null),
            status: "Next player: X",
            winner: null
          }),
          target: "start"
        }
      }
    }
  }
},
  {
    guards: {
      gameOverGuard: (context, event) => {
        const winner = calculateWinner(context.squares);
        return winner || isGameOver(context, event);
      },
      xWins: (context, event) => {
        const winner = calculateWinner(context.squares);
        return winner === "X";
      },
      oWins: (context, event) => {
        const winner = calculateWinner(context.squares);
        return winner === "O";
      },
      noOneWins: (context, event) => {
        const winner = calculateWinner(context.squares);
        return winner === null;
      },
    }
  }
);

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

function isGameOver(context, event) {
  const squares = context.squares;
  const squaresFull = squares.every(value => value !== null);

  return squaresFull;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById("root")
);
