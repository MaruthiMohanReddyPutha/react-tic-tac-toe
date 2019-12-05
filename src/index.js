import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
            return {
                winner: squares[a],
                winCombination: lines[i],
            };
        }
    }
    return null;
}

function Square(props) {
    let className = 'square';
    if(props.isWinner) {
        className += ' winner';
    }
    return (
        <button 
            className={className} 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isWinner) {
        return (
            <Square key={i}
                value={this.props.squares[i]}
                onClick={() => {this.props.onClick(i)}}
                isWinner = {isWinner}
            />
        );
    }

    renderBoardRow(squareGrp, index) {
        return (
            <div key={index} className="board-row">
                {squareGrp}
            </div>
        )
    }

    renderBoard() {
        const boardRows = [];
        // Render 9 squares in a 3 X 3 board format    
        for(let i = 0; i < 3; i++) {
            const squareGrp = [];
            for(let j = 0; j < 3; j++) {
                const squareValue = (i*3)+j;
                squareGrp.push(
                    this.renderSquare(
                        squareValue, 
                        (this.props.winCombination.indexOf(squareValue) > -1)
                    )
                );
            }
            boardRows.push(this.renderBoardRow(squareGrp, i));
        }
        // Return the board rows
        return boardRows;
    }

    render() {
        return (
            <div>
                {
                    /* 
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
                    */
                    this.renderBoard()
                }
            </div>
        );
    }
}

class Game extends React.Component {

    handleClick(i) {
        /**
         * Reading the history using the slice method means we just store the history until the current move
         * And discard all the other steps as if the users start making new moves, we need to generate a new history
         */
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if(calculateWinner(current.squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                }
            ],
            stepNumber: 0,
            xIsNext: true,
        };
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            // Calculate the coordinate of the current move
            let coords = '';
            if(move === 0) {
                coords = `(NA, NA)`;
            } else {
                let currentBox;
                const prevStep = history[move - 1];
                // get the position of the column
                for(let i = 0; i < step.squares.length; i++) {
                    if(step.squares[i] !== prevStep.squares[i]) {
                        currentBox = i;
                        break;
                    }
                }
                //  Row and Column
                const row = Math.floor(currentBox/3);
                const col = (currentBox % 3);
                coords = `(${row + 1}, ${col + 1})`;
            }
            // Set the bold styling for the current selection
            let className = 'link-button';
            if(move === this.state.stepNumber) {
                className += ' bold';
            }

            return (
                <li key={move}>
                    <button className={className} onClick={() => this.jumpTo(move)}>{desc+ ' ' + coords}</button>
                </li>
            );
        });

        let status;
        let winCombination = [];
        let isGameComplete = false;
        if(winner) {
            isGameComplete = true;
            status = 'We have a WINNER: '+ winner.winner;
            winCombination = winner.winCombination;
        } else if(this.state.stepNumber === 9) {
            isGameComplete = true;
            status = 'All moves have completed: MATCH DRAWN';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        let statusClassName = 'status';
        if(isGameComplete) {
            statusClassName += ' game-complete';
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares = {current.squares}
                        onClick = {(i) => {this.handleClick(i)}}
                        winCombination = {winCombination}
                    />
                </div>
                <div className="game-info">
                    <div className={statusClassName}>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

/**
 --------------------------------
< Render the ReactDOM App below >
 --------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

 */

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
