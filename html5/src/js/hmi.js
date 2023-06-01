/**
 * @file hmi.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2023 May 22
 *
 * @section LICENSE
 *
 * Copyright 2016, 2023 Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 *
 * @section DESCRIPTION
 *
 * @brief Class Hmi.
 *
 * Class representing the view or Hmi of Sudoku game.
 * Sudoku is a popular number-placement puzzle.
 *
 */

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

Board.challengeSeed = {
  'Level 1': [
    [
      [ '672519483',
        '835246917',
        '194738652',
        '541382796',
        '987654321',
        '263971548',
        '416897235',
        '759123864',
        '328465179' ],
      [ '+---+-+--',
        '-+-+-+-+-',
        '-+-+-+-+-',
        '+++----+-',
        '-----++--',
        '--------+',
        '+--+-----',
        '--+------',
        '-+----+++' ]
    ],
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
  ],
  'Level 2': [
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
    [
      [ '341972658',
        '627485193',
        '598163247',
        '286347519',
        '975218436',
        '413659872',
        '764831925',
        '859724361',
        '132596784' ],
      [ '----+----',
        '---+-++-+',
        '-++--++--',
        '-------+-',
        '---+-++-+',
        '-++--++--',
        '-+++----+',
        '---------',
        '-+++----+' ]
    ],
  ],
  'Level 3': [
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
        '-+++----+' ],
      'XY-Chain'
    ],
  ],
};

function Board() { this.setup(); }

Board.prototype.determineLevel = function() {
  var index = 0;
  switch ($('#level').val()) {
    case 'Level 1': index = 1; break;
    case 'Level 2 only': index = 2; break;
    case 'Level 3 only': index = 3; break;
    case 'Up to level 2': index = Math.floor( Math.random() * 2 ) + 1; break;
    case 'Up to level 3': 
    default: index = Math.floor( Math.random() * 3 ) + 1; break;
  }
  return 'Level ' + index;
};

Board.prototype.setup = function() {
  var level = this.determineLevel();
  var i = Math.floor( Math.random() * Board.challengeSeed[level].length );
  console.log(level + ' challengeSeed: ' + i);
  $('#stat').html('<br/><br/>' + level + ' challengeSeed: ' + i).css({
          'font-size': '8px',
          'color': 'Gainsboro',
        });
  this.board = [ [], [] ];
  for (var j=0; j<9; ++j) {
    this.board[0][j] = Board.challengeSeed[level][i][0][j];
    this.board[1][j] = Board.challengeSeed[level][i][1][j];
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

function Hmi() {
  this.cursor = { x: -1, y: -1 , rows: [], columns: [] };
  this.renderBoard();
  this.board = null;
  this.editMarkersActive = false;
  this.init();
}

Hmi.prototype.init = function () {
  this.newBoard();
  $(window).resize(this.resize.bind(this));
  $(window).resize();
};

Hmi.prototype.renderBoard = function () {
  var stroke_width = 4;
  this.panel = { x: 390, y: 500 };
  this.paper = Raphael( 'panel', this.panel.x, this.panel.y);
  this.paper.setViewBox(-stroke_width, -stroke_width, 360+stroke_width, (360+2*stroke_width) * this.panel.y / this.panel.x, false );
  this.paper.rect(-stroke_width, -stroke_width, this.panel.x+30, this.panel.y+30 ).attr({
    stroke: 'none', 'stroke-width': 0, 'stroke-linecap': 'round',
    fill: 'none'
  });
  
  /* board */
  this.paper.rect( 0, 0, 360, 360, 12 ).attr({
    stroke: '#777', 'stroke-width': stroke_width, 'stroke-linecap': 'round',
    fill: '#333'
  });
  this.paper.rect( 120, 0, 120, 120 ).attr({
    stroke: '#aaa', 'stroke-width': 0, 'stroke-linecap': 'round',
    fill: '#444'
  });
  this.paper.rect( 0, 120, 120, 120 ).attr({
    stroke: '#aaa', 'stroke-width': 0, 'stroke-linecap': 'round',
    fill: '#444'
  });
  this.paper.rect( 240, 120, 120, 120 ).attr({
    stroke: '#aaa', 'stroke-width': 0, 'stroke-linecap': 'round',
    fill: '#444'
  });
  this.paper.rect( 120, 240, 120, 120 ).attr({
    stroke: '#aaa', 'stroke-width': 0, 'stroke-linecap': 'round',
    fill: '#444'
  });

  
  for ( var i=0; i<9; i++ ) {
    this.cursor.rows[i] = this.paper.rect( 0, i * 40, 360, 40, 12 ).attr({
      stroke: 'none', 'stroke-width': 0, 'stroke-linecap': 'round',
      fill: '#448', opacity: 0 });
    this.cursor.columns[i] = this.paper.rect( i * 40, 0, 40, 360, 12 ).attr({
      stroke: 'none', 'stroke-width': 0, 'stroke-linecap': 'round',
      fill: '#448', opacity: 0 });
  }
  
  this.paper.path( 'M0,120l360,0m-360,120l360,0m-240,-240l0,360m120,-360l0,360' )
        .attr({ 'fill': 'none', stroke: 'black', 'stroke-width': 1, 'stroke-linecap': 'round' });
  this.paper.path( 'M0,40l360,0m-360,40l360,0m-360,80l360,0m-360,40l360,0m-360,80l360,0m-360,40l360,0' )
        .attr({ 'fill': 'none', stroke: 'black', 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-dasharray': '- ' });
  this.paper.path( 'M40,0l0,360m40,-360l0,360m80,-360l0,360m40,-360l0,360m80,-360l0,360m40,-360l0,360' )
        .attr({ 'fill': 'none', stroke: 'black', 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-dasharray': '- ' });
  this.paper.rect( 0, 0, 360, 360, 12 ).attr({
    stroke: '#777', 'stroke-width': stroke_width, 'stroke-linecap': 'round',
    fill: 'none'
  });
  
  
  this.paper.rect( 0, 360+6*stroke_width , 360, 360*2 /9 , 20 ).attr({
    stroke: '#777', 'stroke-width': stroke_width, 'stroke-linecap': 'round',
    fill: 'black'
  });
  this.paper.path( 'M0,424l360,0m-320,-40l0,80m40,-80l0,80m40,-80l0,80m40,-80l0,80m40,-80l0,80m40,-80l0,80m40,-80l0,80m40,-80l0,80' )
        .attr({ 'fill': 'none', stroke: '#333', 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-dasharray': '- ' });
  this.paper.rect( 0, 360+6*stroke_width , 360, 360*2 /9 , 20 ).attr({
    stroke: '#777', 'stroke-width': stroke_width, 'stroke-linecap': 'round',
    fill: 'none'
  });

  this.cells = [];
  for( var r=0; r<9; r++) {
    var col = [];
    for( var c=0; c<9; c++) {
      col[c] = {
        value: this.paper.text( 20+r*40, 20+c*40, ''+c).attr({ "font-size": 20, "font-family": "sans-serif" }).attr({fill: "#fff"}),
        markers: this.createEmptyMarkers( r*40, c*40, "#ccc", 0 ),
        button: this.paper.rect( r*40 + 4, c*40 + 4, 32, 32 ).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
      };
      col[c].button.click( this.clickSelectCellHandler.bind(this) );
    }
    this.cells[r] = col;
  }

  this.keyboardAction = [
    {
      label: this.paper.text( 20, 450, '*').attr({ "font-size": 40, "font-family": "sans-serif" }).attr({fill: "#fff"}),
      button: this.paper.rect( 0, 429, 35, 35, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
    }, // New
    {
      label: this.paper.path('M52,446 A 8 8 0 1 0  52 441 m-1,-4 l1,4 l4,-1.5').attr({ stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round',
            fill: 'none' }),
      button: this.paper.rect( 45, 429, 30, 35, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
    }, // Restart
    {
      label: [  this.createMarkers( 160, 424, "#777", 1.0),
          this.paper.path('M160,424m8,30l5,-6l16,-12  l1.2,0.8l1,1.3l0.3,1.6  l-16,12l-7.4,2.7 m5,-6l1.2,0.8l1,1.2l0.4,1.3 m10,-13l1.2,0.8l1,1.2l0.4,1.3 m-4.8,-1.8l1.2,0.8l1,1.2l0.4,1.3 ').attr({ stroke: '#fff', 'stroke-width': 0.8, 'stroke-linecap': 'round',
            fill: 'none' }),
          this.paper.path('M160,424m14.2,24.8l10.5,-8 m-9.5,9.2l10.5,-8').attr({ stroke: '#fff', 'stroke-width': 0.6, 'stroke-linecap': 'round',
            fill: 'none' })
        ],
      button: this.paper.rect( 160, 429, 40, 35, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
    }, // Fill in markers
    {
      background: this.paper.rect( 240, 424, 40, 40).attr({ 'fill': '#777', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 }),
      label: this.createMarkers( 240, 424, "#fff", 1.0),
      button: this.paper.rect( 240, 429, 40, 35, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
    }, // Edit markers
    {
      label: this.paper.path('M320,414m9,30l7,-7l14,0l0,14l-14,0l-7,-7m10.5,-3l6,6m0,-6l-6,6').attr({ stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round',
            fill: 'none' }),
      button: this.paper.rect( 320, 429, 40, 35, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0, 'fill-opacity': 0.01 })
    }, // Backspace / clear cell
  ]
  for( var e=0; e<this.keyboardAction.length; e++ ) {
    this.keyboardAction[e].button.click( this.clickKeyboardActionHandler.bind(this) );
  }

  this.keyboardValue = [];
  for( var e=0; e<9; e++ ) {
    this.keyboardValue[e] = {
      label: this.paper.text(20 + e*40, 404, '' + (e+1)).attr({ "font-size": 20, "font-family": "sans-serif" }).attr({fill: "#fff"}),
      button: this.paper.rect(e*40, 384, 40, 40, 12).attr({ 'fill': 'white', stroke: 'none',
        'stroke-width': 0 , 'fill-opacity': 0.01 })
    };
    this.keyboardValue[e].button.click( this.clickKeyboardValueHandler.bind(this) );
  }
}

Hmi.prototype.createEmptyMarkers = function ( x, y, c, o ) {
  var markers = [
    this.paper.text(x+ 8, y+ 8, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+ 8, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+ 8, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+ 8, y+20, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+20, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+20, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+ 8, y+32, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+32, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+32, '').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
  ];
  return markers;
}

Hmi.prototype.createMarkers = function ( x, y, c, o ) {
  var markers = [
    this.paper.text(x+ 8, y+ 8, '1').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+ 8, '2').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+ 8, '3').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+ 8, y+20, '4').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+20, '5').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+20, '6').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+ 8, y+32, '7').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+20, y+32, '8').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
    this.paper.text(x+32, y+32, '9').attr({ "font-size": 10, "font-family": "sans-serif" }).attr({ fill: c, opacity: o }),
  ];
  return markers;
}

Hmi.prototype.newBoard = function () {
  this.board = (new Board()).shuffleRows().turn().shuffleRows().permutate();
  this.start();
}

Hmi.prototype.start = function () {
  this.clearMarkers();
  for(var a=0; a<9; a++) {
    for(var b=0; b<9; b++) {
      var cell = this.cells[a][b];
      if( '+' == this.board.board[1][a][b] ) {
        cell.value.attr({ text: this.board.board[0][a][b], fill: 'LightSlateGray' });
      } else {
        cell.value.attr({ text: '', fill: 'Gainsboro' });
      }
    }
  }
  if (this.cursor.x != -1) {
    this.cursor.columns[this.cursor.x].attr({ opacity: 0 });
    this.cursor.rows[this.cursor.y].attr({ opacity: 0 });
  }
  this.cursor.x = -1;
  this.cursor.y = -1;
}

Hmi.prototype.clickSelectCellHandler = function ( event ) {
  for( var y=0; y<9; y++) {
    for( var x=0; x<9; x++) {
      if (this.cells[x][y].button.id == event.currentTarget.raphaelid) {
        // console.log( x + '/' + y );
        if( '-' == this.board.board[1][x][y] ) {
          if (this.cursor.x != -1) {
            this.cursor.columns[this.cursor.x].attr({ opacity: 0 });
            this.cursor.rows[this.cursor.y].attr({ opacity: 0 });
          }
          this.cursor.x = x;
          this.cursor.y = y;
          this.cursor.columns[x].attr({ opacity: 0.5 });
          this.cursor.rows[y].attr({ opacity: 0.5 });
        }
      }
    }
  }
}

Hmi.prototype.clickKeyboardValueHandler = function ( event ) {
  for(var i=0; i<this.keyboardValue.length; ++i) {
    if (this.keyboardValue[i].button.id == event.currentTarget.raphaelid) {
      if ( -1 != this.cursor.x ) {
        console.log( i+1 );
        if ( this.editMarkersActive ) {
          if ( '' == this.cells[this.cursor.x][this.cursor.y].value.attr( 'text' )) {
            this.showAllMarkers( this.cursor.x, this.cursor.y );
            this.toggleMarker( this.cursor.x, this.cursor.y, i+1 );
          }
        } else {
          this.cells[this.cursor.x][this.cursor.y].value.attr({ text: ''+(i+1), opacity: 1.0 });
          if ( this.hasAnyMarkersSet( this.cursor.x, this.cursor.y ) ) {
            this.hideMarkers( this.cursor.x, this.cursor.y );
          }
        }
      }
    }
  }
}

Hmi.prototype.clickKeyboardActionHandler = function ( event ) {
  var action = -1;
  for(var i=0; i<this.keyboardAction.length; ++i) {
    if (this.keyboardAction[i].button.id == event.currentTarget.raphaelid) {
      action = i;
      // console.log( this.keyboardValue[i].label.attr( 'text' ) );
    }
  }
  switch (action) {
    case 0: console.log('New');
      this.newBoard();
      break;
    case 1: console.log('Restart');
      this.start();
      break;
    case 2: console.log('Fill in markers');
      this.fillInMarkers();
      break;
    case 3: console.log('Toggle edit markers');
      this.toggleEditMarkers();
      break;
    case 4: console.log('Clear cell');
      this.clearCell();
      break;
    default: console.log('No action');
  }
}

Hmi.prototype.clearCell = function ( x, y ) {
  if ( -1 != this.cursor.x ) {
    this.cells[this.cursor.x][this.cursor.y].value.attr({ text: '', opacity: 1.0 });
    if (this.hasAnyMarkersSet( this.cursor.x, this.cursor.y )) {
      this.showAllMarkers( this.cursor.x, this.cursor.y );
    }
  }
}

Hmi.prototype.hasAnyMarkersSet = function ( x, y ) {
  var result = false;
  var markers = this.cells[x][y].markers;
  for ( var i=0; i<9; i++ ) {
    result = result || (markers[i].attr( 'text' ) != '');
  }
  return result;
}

Hmi.prototype.hideMarkers = function ( x, y ) {
  var m = this.cells[x][y].markers;
  for (i=0; i<m.length; i++) {
    m[i].attr({ opacity: 0 });
  }
}

Hmi.prototype.showAllMarkers = function ( x, y ) {
  var m = this.cells[x][y].markers;
  for (i=0; i<m.length; i++) {
    m[i].attr({ opacity: 1.0 });
  }
}

Hmi.prototype.toggleMarker = function ( x, y, v ) {
  var m = this.cells[x][y].markers;
  m[v-1].attr({ text: ( '' == m[v-1].attr( 'text' ) ) ? ''+v : '' });
}

Hmi.prototype.fillInMarkers = function () {
  console.log('#fillin-all : ' + $('#fillin-all').is(':checked'));
  for( var y=0; y<9; y++) {
    for( var x=0; x<9; x++) {
      if ( (!this.hasAnyMarkersSet( x, y )) &&
        ('' == this.cells[x][y].value.attr( 'text')) ) {
        this.showAllMarkers( x, y );
        if ($('#fillin-all').is(':checked')) {
          for( var i=0; i<9; i++ ) {
            this.cells[x][y].markers[i].attr({ text: ''+(i+1) });
          }
        } else {
          var n = ''
          var base = { x: Math.floor(x/3)*3, y: Math.floor(y/3)*3 };
          for( var i=0; i<9; i++ ) {
            var offset = { x: i%3, y: Math.floor(i/3) };
            n = n + this.cells[x][i].value.attr( 'text' ) +
              this.cells[i][y].value.attr( 'text' ) +
              this.cells[base.x+offset.x][base.y+offset.y].value.attr( 'text' );
          }
          for( var i=0; i<9; i++ ) {
            this.cells[x][y].markers[i].attr({ text: n.includes(''+(i+1)) ? '' : ''+(i+1) });
          }
        }
      }
    }
  }
}

Hmi.prototype.clearMarkers = function () {
  for( var y=0; y<9; y++) {
    for( var x=0; x<9; x++) {
      for( var i=0; i<9; i++ ) {
        this.cells[x][y].markers[i].attr({ text: '' });
      }
      this.hideMarkers( x, y );
    }
  }
}

Hmi.prototype.toggleEditMarkers = function () {
  this.editMarkersActive = !this.editMarkersActive;
  // console.log('editMarkersActive : ' + this.editMarkersActive);
  this.keyboardAction[3].background.attr({ 'fill-opacity': this.editMarkersActive ? 1.0 : 0 });
}

Hmi.prototype.resize = function () {
  var offsetHeight = 120,
    offsetWidth = 70,
    innerWidth = window.innerWidth - offsetWidth,
    innerHeight = window.innerHeight - offsetHeight;
  var boardWidth = innerHeight>innerWidth ? 0.85 * innerWidth : 0.85 * innerHeight,
    boardHeight = boardWidth;
  this.size = innerWidth/innerHeight < this.panel.x/this.panel.y ?
    { x: innerWidth, y: innerWidth * this.panel.y/this.panel.x } :
    { x: innerHeight * this.panel.x/this.panel.y, y: innerHeight } ;
  this.paper.setSize( this.size.x, this.size.y );
};

$().ready( function () { new Hmi(); } );
