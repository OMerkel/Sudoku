//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

var challengeSeed = [
[
  [ '625413789',
    '184679325',
    '793285461',
    '456921837',
    '819734652',
    '237856914',
    '361597248',
    '942168573',
    '578342196' ],
  [ '+++-----+',
    '+-+----++',
    '-+---+-+-',
    '---+++-+-',
    '--+-+----',
    '---+-+-++',
    '---++---+',
    '++-----+-',
    '-++-+++--' ]
],
[
  [ '675982431',
    '182543976',
    '934671528',
    '419237685',
    '527869143',
    '863415297',
    '291358764',
    '356794812',
    '748126359' ],
  [ '+----+++-',
    '+--++--+-',
    '--------+',
    '+---+-+--',
    '---+-+---',
    '-+--+---+',
    '--+-++--+',
    '+--------',
    '-+++----+' ]
],
[
  [ '138976425',
    '456231798',
    '972458163',
    '327584916',
    '819362547',
    '645719832',
    '761843259',
    '593127684',
    '284695371' ],
  [ '+----+---',
    '--+++---+',
    '--+-+--+-',
    '-+-+-++--',
    '+----++--',
    '----+--+-',
    '++-------',
    '-------++',
    '--+-+++--' ]
],
];

Array.prototype.shuffle = function () {
  for(var i=this.length-1; i>0; --i) {
    var j = Math.floor( Math.random() * (i + 1) );
    if(j!=i) {
      var t = this[i];
      this[i] = this[j];
      this[j] = t;
    }
  }
  return this;
};

function Board() { this.setup(); }

Board.prototype.setup = function() {
  var i = Math.floor( Math.random() * challengeSeed.length );
  console.log('challengeSeed: ' + i);
  this.board = [ [], [] ];
  for (var j=0; j<9; ++j) {
    this.board[0][j] = challengeSeed[i][0][j];
    this.board[1][j] = challengeSeed[i][1][j];
  }
};

Board.prototype.shuffleRows = function() {
  var result = [ [], [] ];
  var course = [ 0, 1, 2 ].shuffle();
  for(var rowCourse=0; rowCourse<3; ++rowCourse) {
    var fine = [ 0, 1, 2 ].shuffle();
    for(var rowFine=0; rowFine<3; ++rowFine) {
      result[0][result[0].length]=this.board[0][course[rowCourse]*3+fine[rowFine]];
      result[1][result[1].length]=this.board[1][course[rowCourse]*3+fine[rowFine]];
    }
  }
  this.board = result;
  return this;
};

Board.prototype.turn = function () {
  var result = [ [ '', '', '', '', '', '', '', '', '' ],
                 [ '', '', '', '', '', '', '', '', '' ] ];
  for(var x=0; x<9; ++x) {
    for(var y=8; y>=0; --y) {
      result[0][x]+=this.board[0][y][x];
      result[1][x]+=this.board[1][y][x];
    }
  }
  this.board = result;
  return this;
};

Board.prototype.permutate = function () {
  var map = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ].shuffle();
  for(var x=0; x<9; ++x) {
    for(var y=0; y<9; ++y) {
      this.board[0][y][x] = map[this.board[0][y][x]];
    }
  }
  return this;  
};

var CURRENTEDIT = 'current edit';
var edit = {};
var board = null;

function unselect() {
  var currentEdit = edit[CURRENTEDIT];
  if(currentEdit) {
    var v = currentEdit.html();
    if('?' == v) currentEdit.html( '&nbsp;' );
    currentEdit.css({
      'font-size': '20px',
      'transition-duration': '0.5s',
      '-webkit-animation': '',
      'animation': '',
    });
    edit[CURRENTEDIT] = null;
  }
}

function clickHandler( event ) {
  var cell = $('#' + event.target.id);
  var a = Number(event.target.id.slice(-2,-1));
  var b = Number(event.target.id.slice(-1));
  unselect();
  if('+' == board.board[1][a][b]) {
    unselect();
  } else {
    var v = cell.html();
    if('&nbsp;' == v) cell.html( '?' );
    cell.css({
      // 'font-size': '28px',
      'transition-duration': '0s',
      '-webkit-animation': 'selectedcell 0.5s infinite alternate',
      '-webkit-animation-play-state': 'running',
      'animation': 'selectedcell 0.5s infinite alternate',
      'animation-play-state': 'running',
    });
    edit[CURRENTEDIT] = cell;
  }
}

function clickEditHandler( event ) {
  if(edit[CURRENTEDIT]) {
    if('editq'==event.target.id) {
      edit[CURRENTEDIT].html('?');
    } else {
      var v = event.target.id.slice(-1);
      edit[CURRENTEDIT].html(v);
    }
  }
}

function newBoard() {
  board = (new Board()).shuffleRows().turn().shuffleRows().permutate();
  init();
}

function init() {
  unselect();
  for(var a=0; a<9; a++) {
    for(var b=0; b<9; b++) {
      var cell = $(('#cell'+a)+b);
      if('+' == board.board[1][a][b]) {
        cell.html( board.board[0][a][b] ).css({
          'font-size': '20px',
          'color': 'LightSlateGray',
          'transition-duration': '0.5s',
        });
      } else {
        cell.html( '&nbsp;' ).css({
          'font-size': '0px',
          'color': 'Gainsboro',
        });
      }
    }
  }
}

function initHmi() {
  newBoard();
  $('#new').click(newBoard);
  $('#restart').click(init);
  for(var a=1; a<=9; a++) {
    $('#edit'+a).click(clickEditHandler);
  }
  $('#editq').click(clickEditHandler);
  // $('#editp').click(clickEditHandler);
  // $('#editn').click(clickEditHandler);
  for(var a=0; a<9; a++) {
    for(var b=0; b<9; b++) {
      $(('#cell'+a)+b).click(clickHandler);
    }
  }
}

$().ready( initHmi );
