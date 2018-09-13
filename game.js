	window.Game = {};

	/**scroll control**/
	let lastScrollTop = 0;
	// Cache window object
	let $w = $(window);	
	// Get viewport height
	let vw = $w.width();
	let offsetLogo = $('.logo').offset();
    let offsetWifi = $('.transmitterr').offset();


	// DOM variable 
	let teaser =  $('#teaser').text; 
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");
    let tryGame =  $('#tryGame') ; 
    let restart =  $('#restart') ; 

	// game settings:   
	let timer = 20 ; 

	Game.controls =  {
		left: false,
		up: false,
		right: false,
		down: false,
	};
	Game.status =  {
		losee: false 
	} ;
	


(function(){
	
    var lastUpdateTime = Date.now();
	var FPS = 30;
	var INTERVAL = 1000/FPS; // milliseconds
		
	// Time variables
	var refreshIntervalId = null ; 
	var timerIntervalId = null ; 

	// check for reset! regnerate another Maze 
	var doReset = true ;

	// maze dimensions  
	var cellSize = 50 ; 
	var nbHorizontalCells = 17;
	var nbVerticalCells = 9;

    // loading Assets 
	var spriteImage = new Image();
	spriteImage.onload = function() {
	 sprite.ready = true; 
	};
	spriteImage.src = 'img/sprite.png';

	var goalImage = new Image();
	goalImage.onload = function() { goal.ready = true; };
	goalImage.src = 'img/goal.png';

    // game Objects
	var sprite = {
		speed: 256 ,
		size: 40 , 
		ready: false ,
		radius : 1  // Declaration of the radar circle radius
	};
	var goal = {
		size: 40 , 
		ready: false,
	};

	var diagonal = Math.pow(Math.pow(nbHorizontalCells * cellSize, 2) +
				   Math.pow(nbVerticalCells * cellSize, 2), 0.5);

	var radius = 1;
	// How far the sprite can see
	var sightRange = 1.5* cellSize + 40;



    /** MAZE Generator **/
    var maze = (function() {

	var nbHorizontalCells;
	var nbVerticalCells;
	var cellSize;
	var wallThickness = 16;
	// A 2D array to know if a cell is reachable; used during maze generation
	var visited = [];
	// A 2D array to know where the vertical walls are
	var vWalls = [];
	// A 2D array to know where the horizontal walls are
	var hWalls = [];

	var init = function(_nbHorizontalCells, _nbVerticalCells, _cellSize) 
	{
		cellSize = _cellSize;
		nbHorizontalCells = _nbHorizontalCells;
		nbVerticalCells = _nbVerticalCells;
		
		var i = 0;
		var j = 0;
		
		for (i = 0; i < nbVerticalCells; i++) {
		  visited[i] = [];
		  for (j = 0; j < nbHorizontalCells; j++) {
			visited[i][j] = 0;
		  }
		}
		
		// horizontal walls (1=there is a wall)
		for (i = 0; i < nbVerticalCells + 1; i++) {
		  hWalls[i] = [];
		  for (j = 0; j < nbHorizontalCells; j++) {
			hWalls[i][j] = 1;
		  }
		}
		
		// vertical walls (1=there is a wall)
		for (i = 0; i < nbVerticalCells; i++) {
		  vWalls[i] = [];
		  for (j = 0; j < nbHorizontalCells + 1; j++)
			vWalls[i][j] = 1;
		}
		};

	var UnvisitedNeighbors = function(x, y) 
	{
		var unvisitedNeighbors = [];
		var neighbors = [
			  [x, y - 1],
			  [x, y + 1],
			  [x - 1, y],
			  [x + 1, y]
		];

		for (var i = 0; i < 4; i++) {
		  if (neighbors[i][0] > -1 && neighbors[i][0] < nbVerticalCells &&
			 neighbors[i][1] > -1 && neighbors[i][1] < nbHorizontalCells &&
			 visited[neighbors[i][0]][neighbors[i][1]] === 0) {
			unvisitedNeighbors.push([neighbors[i][0], neighbors[i][1]]);
		  }
		}
		return (unvisitedNeighbors);
	};
		
	var generateMaze = function() {  

		// current cell for generation
		var cell = [0, 0];

		// path (last element is the current cell)
		var path = [cell];

		while (path.length > 0) 
		{
		  var current = path[path.length - 1];
		  visited[current[0]][current[1]] = 1;
		  var potentialNeighbors = UnvisitedNeighbors(current[0], current[1]);
		  var nbNeighbors = potentialNeighbors.length;
		  // If there are no neighbor cells to visit (they are already visited),
		  // we pop the last element of path - go back one step.
		  if (nbNeighbors === 0) {
			path.pop();
		  } 
		  else {  
			// else, we pick a random reachable neighbor and destroy the wall
			var nextCell = potentialNeighbors[Math.floor(Math.random() *
			   nbNeighbors)];
			if (current[0] === nextCell[0]) { // vertical wall broken
			  vWalls[current[0]][Math.ceil(0.5 * (current[1] + nextCell[1]))] = 0;
			} 
			else {
			  hWalls[Math.ceil(0.5 * (current[0] + nextCell[0]))][current[1]] = 0;
			}
			path.push(nextCell);
		  }
		}
	};

	/**
	* Uses the vWalls and hWalls variables to draw the maze (i.e. all the walls)
	*/

	var drawMaze = function() {
	ctx.beginPath();
	ctx.lineWidth = 10;
	var i;
	var j;
	// Draw horizontal walls first
	for (i = 0; i < nbVerticalCells + 1; i++) {
	  for (j = 0; j < nbHorizontalCells; j++)
		if (hWalls[i][j] === 1) {
		  ctx.moveTo(j * cellSize - wallThickness / 2, i * cellSize);
		  ctx.lineTo((j + 1) * cellSize + wallThickness / 2, i * cellSize);
		}
	}

	// Then draw the vertical walls
	for (i = 0; i < nbVerticalCells; i++) {
	  for (j = 0; j < nbHorizontalCells + 1; j++)
		if (vWalls[i][j] === 1) {
		  ctx.moveTo(j * cellSize, i * cellSize - wallThickness / 2);
		  ctx.lineTo(j * cellSize, (i + 1) * cellSize + wallThickness / 2);
		}
	}
	ctx.strokeStyle = '#4a6566';
	ctx.stroke();
	};

	var updatePositions = function(sprite, step) {
	var targetX = sprite.x;
	var targetY = sprite.y;
		
	// First update pixel-position
	 if(Game.controls.up)
	 { 
	  targetY = sprite.y - Math.min(sprite.speed * step, cellSize);
	  if (hWalls[sprite.cellY][sprite.cellX] === 1 ||
		(((sprite.cellX + 1) * cellSize - sprite.x) < wallThickness &&
		vWalls[sprite.cellY - 1][sprite.cellX + 1] === 1) ||
		  ((sprite.x - sprite.cellX * cellSize) < wallThickness &&
		  vWalls[sprite.cellY - 1][sprite.cellX] === 1)) {
		sprite.y = Math.max(targetY,
		sprite.cellY * cellSize + wallThickness);
	  } else {
		sprite.y = targetY;
	  }
	  sprite.cellY = Math.floor(sprite.y / cellSize);
	}

	 if(Game.controls.down)
	 {
	  targetY = sprite.y + Math.min(sprite.speed * step, cellSize);
	  if (hWalls[sprite.cellY + 1][sprite.cellX] === 1 ||
		(((sprite.cellX + 1) * cellSize - sprite.x) < wallThickness &&
		vWalls[sprite.cellY + 1][sprite.cellX + 1] === 1) ||
		  ((sprite.x - sprite.cellX * cellSize) < wallThickness &&
		  vWalls[sprite.cellY + 1][sprite.cellX] === 1)) {
		sprite.y = Math.min(targetY,
		(sprite.cellY + 1) * cellSize - wallThickness);
	  } else {
		sprite.y += sprite.speed * step;
	  }
	  sprite.cellY = Math.floor(sprite.y / cellSize);
	}

	 if(Game.controls.left)
	 {
	  targetX = sprite.x - Math.min(sprite.speed * step, cellSize);
	  if (vWalls[sprite.cellY][sprite.cellX] === 1 ||
		(((sprite.cellY + 1) * cellSize - sprite.y) < wallThickness &&
		hWalls[sprite.cellY + 1][sprite.cellX - 1] === 1) ||
		  ((sprite.y - sprite.cellY * cellSize) < wallThickness &&
		  hWalls[sprite.cellY][sprite.cellX - 1] === 1)) {
		sprite.x = Math.max(targetX,
		sprite.cellX * cellSize + wallThickness);
	  } else {
		sprite.x -= sprite.speed * step;
	  }
	  sprite.cellX = Math.floor(sprite.x / cellSize);
	}

	 if(Game.controls.right)
	 {

	  targetX = sprite.x + Math.min(sprite.speed * step, cellSize);
	  if (vWalls[sprite.cellY][sprite.cellX + 1] === 1 ||
		(((sprite.cellY + 1) * cellSize - sprite.y) < wallThickness &&
		hWalls[sprite.cellY + 1][sprite.cellX + 1] === 1) ||
		  ((sprite.y - sprite.cellY * cellSize) < wallThickness &&
		  hWalls[sprite.cellY][sprite.cellX + 1] === 1)) {
		sprite.x = Math.min(targetX,
		(sprite.cellX + 1) * cellSize - wallThickness);
	  } else {
		sprite.x += sprite.speed * step;
	  }
	  sprite.cellX = Math.floor(sprite.x / cellSize);
	}

	// Then update cell-position
	sprite.cellY = Math.floor(sprite.y / cellSize);
	sprite.cellX = Math.floor(sprite.x / cellSize);
	};
		
	return {
	init: init,
	generateMaze: generateMaze,
	drawMaze: drawMaze,
	updatePositions: updatePositions
	};
	})();
	

	/** Game Logic */

	//Update all the objects on the canvas	
	var update = function(step) 
	{ 
	  var distanceToGoal = Math.pow(Math.pow(sprite.x - goal.x, 2) +
	  Math.pow(sprite.y - goal.y, 2), 0.5);
	  sprite.radius = (sprite.radius + (1 / (distanceToGoal / diagonal) - 1)) %
	   (distanceToGoal / 2);

	  // Update the sprite's position based on the maze design
	  maze.updatePositions(sprite, step);

	  // If the sprite reaches the goal, reset the game
	  if (Math.abs(sprite.x - goal.x) < 0.2 * cellSize &&
	  Math.abs(sprite.y - goal.y) < 0.2 * cellSize) {
	  reset();
	  }
	};

	//Renders all the objects on the canvas
	var render = function() 
	{
		// Clear all
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Draw the maze
		maze.drawMaze();
		// Draw the goal and the sprite
		if (goal.ready) {
		ctx.drawImage(goalImage, goal.x - sprite.size / 2, goal.y - sprite.size / 2);
		}
		if ( sprite.ready) {
		ctx.drawImage(spriteImage, sprite.x - sprite.size / 2,
		  sprite.y - 0.75 * sprite.size);
		}

		// Draw the radar around the sprite
		ctx.beginPath();
		ctx.arc(sprite.x, sprite.y, sprite.radius, 0, 2 * Math.PI, false);
		ctx.lineWidth = 5;
		ctx.fillStyle = 'transparent';
		ctx.fill(); 
		ctx.strokeStyle = 'rgba(74, 101, 102,' + (1 - (sprite.radius / 300)) + ')';
		ctx.stroke();
		ctx.closePath();

		// Draw the darkness gradient around the sprite
		ctx.beginPath();
		var grd = ctx.createRadialGradient(sprite.x, sprite.y, 100,
		sprite.x, sprite.y, sightRange);
		var opacity = 1; // 55% visible
		grd.addColorStop(0, 'transparent');
		grd.addColorStop(1, 'rgba(10,10,10,' + opacity + ')');
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.closePath();

	};

	//Resets 
	var reset = function() {

		  //Initialise sprite and goal in random locations
		  sprite.cellX = Math.floor(Math.random() * nbHorizontalCells);
		  sprite.cellY = Math.floor(Math.random() * nbVerticalCells);
		  sprite.x = (sprite.cellX + 0.5) * cellSize;
		  sprite.y = (sprite.cellY + 0.5) * cellSize;

		  goal.cellX = Math.floor(Math.random() * nbHorizontalCells);
		  goal.cellY = Math.floor(Math.random() * nbVerticalCells);
		  goal.x = (goal.cellX + 0.5) * cellSize;
		  goal.y = (goal.cellY + 0.5) * cellSize;

		  // Initialise, generate a random maze, and sets the starting time
		  maze.init(nbHorizontalCells, nbVerticalCells, cellSize);
		  maze.generateMaze();

		  timer = 20 ; 
		};


	// Game loop
	var gameLoop  = function() {

			if (  Game.status.losee === true )
			{ 
				clearInterval(refreshIntervalId);
				refreshIntervalId = null ; 
				
				clearInterval(timerIntervalId);
			    timerIntervalId = null ;
				
				timer = 20 ; 
				gameOver(); 
			}

			else
			{
				if (doReset){
				reset();
				doReset = false;
			}

           var now = Date.now();
		   // Estimate the time since the last update was made
		   var delta = now - lastUpdateTime;
			   render();
				
				  // Update the game according to how much time has passed
		   update(delta / 1000);
				lastUpdateTime = now;
		}};
    
	Game.play =  function() { 
	   timerIntervalId =  setInterval(function(){timerStart();}, 1000);
	   refreshIntervalId  = setInterval(function(){ gameLoop();}, INTERVAL);
	};
	
	Game.restart =  function() 
	{  	
		reset(); 
		render(); 
		refreshIntervalId = setInterval(function(){ gameLoop();}, INTERVAL);
		timerIntervalId =  setInterval(function(){timerStart();}, 1000);
    }
})();

	//Hide element 
	function hide(el) 
	{
		el.style.display = 'none';
	}

	//Show element
	function show(el) 
	{
		el.style.display = 'block';
	} 

	//Start Timer
	function timerStart() 
	{
		$('#timer').text( timer.toString() ) ;
		timer -= 1; 
		if(timer < 0 )
		{   
			Game.status.losee = true ;  
		}
	}

	//End the game and restart
	function gameOver() 
	{ 
		$('#gameOver').show();  
	}
    
    function tryPlay(){
		$('#mainMenu').hide() ; 
		$('#game').show();
		Game.play();
	}

    tryGame.click( function()
    {
		tryPlay();
	}); 

    restart.click( function()
	{
		$('#gameOver').hide() ;
		Game.status.losee = false ; 
		Game.restart()
	});
	
	$(window).on( "keydown", function(e){
		
		switch(e.keyCode)
		{
			case 37: // left arrow
				Game.controls.left = true;
				break;
			case 38: // up arrow
				Game.controls.up = true;
				break;
			case 39: // right arrow
				Game.controls.right = true;
				break;
			case 40: // down arrow
				Game.controls.down = true;
				break;
		}
	});
	$(window).on( "keyup", function(e){
	
		switch(e.keyCode)
		{
			case 37: // left arrow
				Game.controls.left = false;
				break;
			case 38: // up arrow
				Game.controls.up = false;
				break;
			case 39: // right arrow
				Game.controls.right = false;
				break;
			case 40: // down arrow
				Game.controls.down = false;
				break;
			case 80: // key P pauses the game
				Game.togglePause();
				break;      
		}
	});

	// by Emmanual - stackoverflow.com
	$(window).scroll(function(e) {
		
		
		if ( vw <= 400){
			
	      var imgPosition = $('img').offset.top ; 
          console.log("imgPosition" + imgPosition ) ;
		 
			
			//$('.logo').offset({top: offsetLogo.top});
			//$("img").remove();
				
			}
				
			
		
	});
