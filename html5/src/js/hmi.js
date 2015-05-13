//
// Copyright (c) 2015 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

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

Board.challengeSeed = [
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

function Board() { this.setup(); }

Board.prototype.setup = function() {
  var i = Math.floor( Math.random() * Board.challengeSeed.length );
  console.log('challengeSeed: ' + i);
  this.board = [ [], [] ];
  for (var j=0; j<9; ++j) {
    this.board[0][j] = Board.challengeSeed[i][0][j];
    this.board[1][j] = Board.challengeSeed[i][1][j];
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

Hmi.CURRENTEDIT = 'current edit';

function Hmi() {
  this.edit = {};
  this.board = null;
  this.init();
}

Hmi.prototype.init = function () {
  $('#new').on('click', this.newBoard.bind(this));
  $('#restart').on('click', this.start.bind(this));
  this.newBoard();
  for(var a=1; a<=9; a++) {
    $('#edit'+a).on('click', this.clickEditHandler.bind(this));
  }
  $('#editq').on('click', this.clickEditHandler.bind(this));
  // $('#editp').on('click', this.clickEditHandler.bind(this));
  // $('#editn').on('click', this.clickEditHandler.bind(this));
  for(var a=0; a<9; a++) {
    for(var b=0; b<9; b++) {
      $(('#cell'+a)+b).on('click', this.clickHandler.bind(this));
    }
  }
  $(window).resize(this.resize.bind(this));
  $(window).resize();
};

Hmi.prototype.newBoard = function () {
  this.board = (new Board()).shuffleRows().turn().shuffleRows().permutate();
  this.start();
}

Hmi.prototype.start = function () {
  this.unselect();
  for(var a=0; a<9; a++) {
    for(var b=0; b<9; b++) {
      var cell = $(('#cell'+a)+b);
      if( '+' == this.board.board[1][a][b] ) {
        cell.html( this.board.board[0][a][b] ).css({
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

Hmi.prototype.unselect = function () {
  var currentEdit = this.edit[Hmi.CURRENTEDIT];
  if( currentEdit ) {
    var v = currentEdit.html();
    if( '?' == v ) currentEdit.html( '&nbsp;' );
    currentEdit.css({
      'font-size': '20px',
      'transition-duration': '0.5s',
      '-webkit-animation': '',
      'animation': '',
    });
    this.edit[Hmi.CURRENTEDIT] = null;
  }
}

Hmi.prototype.clickHandler = function ( event ) {
  var cell = $('#' + event.target.id);
  var a = Number(event.target.id.slice(-2,-1));
  var b = Number(event.target.id.slice(-1));
  this.unselect();
  if( '+' == this.board.board[1][a][b] ) {
    unselect();
  } else {
    var v = cell.html();
    if( '&nbsp;' == v ) cell.html( '?' );
    cell.css({
      // 'font-size': '28px',
      'transition-duration': '0s',
      '-webkit-animation': 'selectedcell 0.5s infinite alternate',
      '-webkit-animation-play-state': 'running',
      'animation': 'selectedcell 0.5s infinite alternate',
      'animation-play-state': 'running',
    });
    this.edit[Hmi.CURRENTEDIT] = cell;
  }
}

Hmi.prototype.clickEditHandler = function ( event ) {
  if( this.edit[Hmi.CURRENTEDIT] ) {
    if( 'editq' == event.target.id ) {
      this.edit[Hmi.CURRENTEDIT].html('?');
    } else {
      var v = event.target.id.slice(-1);
      this.edit[Hmi.CURRENTEDIT].html(v);
    }
  }
}

Hmi.prototype.resize = function () {
  var innerWidth = window.innerWidth,
    innerHeight = window.innerHeight;
  var boardWidth = innerHeight>innerWidth ? 0.85 * innerWidth : 0.85 * innerHeight,
    boardHeight = boardWidth;
  var minSize = 40;
  this.buttonSize = 0.05 * innerWidth < minSize ? minSize : 0.05 * innerWidth;
  var size = {
    'width': this.buttonSize+'px', 'height': this.buttonSize+'px',
    'background-size': this.buttonSize+'px ' + this.buttonSize+'px',
  };
  $('#customMenu').css(size);
  $('#customBackRules').css(size);
  $('#customBackAbout').css(size);
};

$().ready( function () { new Hmi(); } );
