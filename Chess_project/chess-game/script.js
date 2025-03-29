const chessBoard = document.getElementById('chessBoard');
const turnIndicator = document.getElementById('turnIndicator');

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieces = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let selectedCell = null;
let turn = 'white'; // White moves first
let whiteKingPosition = { row: 7, col: 4 };
let blackKingPosition = { row: 0, col: 4 };

function createBoard() {
  chessBoard.innerHTML = ''; // Clear board
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      if ((row + col) % 2 === 0) {
        cell.classList.add('black');
      } else {
        cell.classList.add('white');
      }

      const piece = initialBoard[row][col];
      if (piece) {
        cell.textContent = pieces[piece];
        cell.dataset.piece = piece;
      }

      cell.addEventListener('click', () => onCellClick(cell));
      chessBoard.appendChild(cell);
    }
  }
}

function onCellClick(cell) {
  const row = cell.dataset.row;
  const col = cell.dataset.col;
  const piece = cell.dataset.piece;

  if (selectedCell) {
    if (isValidMove(selectedCell, cell)) {
      movePiece(selectedCell, cell);
      if (isInCheck(turn)) {
        undoMove(selectedCell, cell);
        alert('Move puts the king in check!');
      } else {
        switchTurn();
      }
    }
    selectedCell.classList.remove('highlight');
    selectedCell = null;
  } else if (piece && isTurnValid(piece)) {
    selectedCell = cell;
    cell.classList.add('highlight');
  }
}

function isTurnValid(piece) {
  return (turn === 'white' && piece === piece.toUpperCase()) ||
         (turn === 'black' && piece === piece.toLowerCase());
}

function isValidMove(fromCell, toCell) {
  const fromRow = parseInt(fromCell.dataset.row);
  const fromCol = parseInt(fromCell.dataset.col);
  const toRow = parseInt(toCell.dataset.row);
  const toCol = parseInt(toCell.dataset.col);
  const fromPiece = fromCell.dataset.piece;
  const toPiece = toCell.dataset.piece;

  // Basic rules: Cannot capture own piece
  if (toPiece && isTurnValid(toPiece)) {
    return false;
  }

  // Check movement for each piece type
  switch (fromPiece.toLowerCase()) {
    case 'p': // Pawn
      if (fromPiece === 'P') {
        if (fromCol === toCol && (toRow === fromRow - 1 || (fromRow === 6 && toRow === 4))) {
          return !toPiece;
        } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow - 1) {
          return toPiece && toPiece !== fromPiece;
        }
      }
      if (fromPiece === 'p') {
        if (fromCol === toCol && (toRow === fromRow + 1 || (fromRow === 1 && toRow === 3))) {
          return !toPiece;
        } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + 1) {
          return toPiece && toPiece !== fromPiece;
        }
      }
      break;
    case 'n': // Knight
      if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) {
        return true;
      }
      if (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2) {
        return true;
      }
      break;
    case 'r': // Rook
      if (fromRow === toRow || fromCol === toCol) {
        return !isPathBlocked(fromRow, fromCol, toRow, toCol);
      }
      break;
    case 'b': // Bishop
      if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
        return !isPathBlocked(fromRow, fromCol, toRow, toCol);
      }
      break;
    case 'q': // Queen
      if (fromRow === toRow || fromCol === toCol || Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
        return !isPathBlocked(fromRow, fromCol, toRow, toCol);
      }
      break;
    case 'k': // King
      if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
        return true;
      }
      break;
    default:
      return false;
  }

  return false;
}

function isPathBlocked(fromRow, fromCol, toRow, toCol) {
  if (fromRow === toRow) {
    const step = fromCol < toCol ? 1 : -1;
    for (let col = fromCol + step; col !== toCol; col += step) {
      if (document.querySelector(`[data-row="${fromRow}"][data-col="${col}"]`).dataset.piece) {
        return true;
      }
    }
  } else if (fromCol === toCol) {
    const step = fromRow < toRow ? 1 : -1;
    for (let row = fromRow + step; row !== toRow; row += step) {
      if (document.querySelector(`[data-row="${row}"][data-col="${fromCol}"]`).dataset.piece) {
        return true;
      }
    }
  } else {
    const rowStep = fromRow < toRow ? 1 : -1;
    const colStep = fromCol < toCol ? 1 : -1;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    while (row !== toRow && col !== toCol) {
      if (document.querySelector(`[data-row="${row}"][data-col="${col}"]`).dataset.piece) {
        return true;
      }
      row += rowStep;
      col += colStep;
    }
  }
  return false;
}

function movePiece(fromCell, toCell) {
  toCell.textContent = fromCell.textContent;
  toCell.dataset.piece = fromCell.dataset.piece;
  fromCell.textContent = '';
  fromCell.removeAttribute('data-piece');

  toCell.classList.add('moving');
  setTimeout(() => toCell.classList.remove('moving'), 300);
}

function undoMove(fromCell, toCell) {
  fromCell.textContent = toCell.textContent;
  fromCell.dataset.piece = toCell.dataset.piece;
  toCell.textContent = '';
  toCell.removeAttribute('data-piece');
}

function switchTurn() {
  turn = turn === 'white' ? 'black' : 'white';
  turnIndicator.textContent = `Current Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
}

function isInCheck(playerColor) {
  const kingPosition = playerColor === 'white' ? whiteKingPosition : blackKingPosition;
  const opponentColor = playerColor === 'white' ? 'black' : 'white';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const piece = cell.dataset.piece;

      if (piece && isTurnValid(piece) && piece.toLowerCase() !== 'k') {
        if (isValidMove(cell, document.querySelector(`[data-row="${kingPosition.row}"][data-col="${kingPosition.col}"]`))) {
          return true;
        }
      }
    }
  }
  return false;
}

createBoard();
