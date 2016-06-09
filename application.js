/*
Pseudo code

1. Create viewport
  1.1. As a bonus it should be responsive
2. Create global variables - sprites, background, current score, best score player 1, player 2
3. Add spritesheet
  3.1 Create variables for spritesheet
4. Create gameloop - 60fps
5. Create blocks
  5.1. Top and bottom blocks
    5.1.1. Generate blocks with random attributes/frequency - Append a div with a class. setInterval for frequency.
    5.1.2. Stop blocks from being generated when character dies
    5.1.3. Stop blocks from moving when character dies
6. Collision detection
  6.1. If character hit box hits the same position as a block then stop
  6.2 Adjust character box boundaries to minimise transparent space
7. Title screen
  7.1. Character floats waiting for user input. Game starts on user input
  7.2. Use Buzz to add Mexican national anthem to title screen - loop audio
8. Scores
  8.1. Calculate scores for each block that passes the character - or when animation finishes
  8.2. Divide score by 2 as there are 2 blocks that pass at the same time
  8.3. Push current score to an array
  8.4. Math.max the array to get the current highest score
  8.5. Display current and best score on one screen
    8.5.1. Stop Mexican music on score screen
    8.5.2. Play Trump soundbite then USA national anthem
9. Add reset button to score screen
  9.1. Reset all values and variables back to initial state and rerun the title screen game loop

*/

$(document).ready(function() {
  // Interval Variables
  var gameLoop = null;
  var bounce   = null;

  // HTML elements
  var $character      = $("#character");
  var $background     = $("#background");
  var $ground         = $("#ground");
  var $innerContainer = $("#innerContainer");
  var $startScreen    = $("#startScreen");
  var $pressPlay      = $("#pressPlay");
  var $scoreScreen    = $("#scoreScreen");
  var $playerScore    = $("#playerScore");
  var $bestScore      = $("#bestScore");
  var $restartBtn     = $("#restartBtn");
  var $loserText      = $("#loserText");
  var $trump          = $("#trump");
  var $usa            = $("#usa");

  // System Variable
  var characterMovement           = 0;
  var currentBlockGenerationSpeed = 0;
  var durationTillNextBlock       = currentBlockGenerationSpeed;

  // Default Settings
  var characterMovementIncrease = 20;
  var keycode                   = 32; // Keycode for Spacebar
  var started                   = false;
  var isCharacterDead           = false; //check if character is dead used for score function

  // Game Settings
  var characterHeight       = 56;
  var characterWidth        = 63;
  var characterInitialTop   = 220;
  var characterInitialLeft  = 80;
  var xMin                  = 0;
  var xMax                  = 1000;
  var yMin                  = 0;
  var yMax                  = 600;
  var gravityIncrease       = 6;
  var blockWidth            = 80;
  var blockSpeedDuration    = 2000;

  //Scroll Speed
  var backgroundScrollDuration = 50000;
  var groundScrollDuration     = 20000;
  var gameLoopDuration         = 17;

  //Sounds and music
  var mexicanMusic            = new buzz.sound("./sounds/mexicanAnthem8.mp3",
                                { preload: true, loop: true });
  var muricaMusic             = new buzz.sound("./sounds/usaAnthem8.mp3",
                                { preload: true, loop: false });
  var greatWall               = new buzz.sound("./sounds/greatWall.mp3",
                                { preload: true, loop: false });
  var trump10ftTall           = new buzz.sound("./sounds/trump10ftTaller.mp3",
                                { preload: true, loop: false });

  //Scoring
  var bestScore = [];
  var currScore = 0;


  //Random height generator for the blocks
  var randBlockHeight = function() {
    return Math.floor((Math.random() * 220) + 50);
  };

  //this function stops the animations and generation of blocks
  var stopGame = function() {
    clearInterval(gameLoop);
    isCharacterDead = true;
    var $blockTop = $(".blockTop");
    var $blockBottom = $(".blockBottom");
    $blockTop.stop(true);
    $blockBottom.stop(true);
    $ground.css({"-webkit-animation-play-state": "paused", "animation-play-state": "paused"})
    $background.css({"-webkit-animation-play-state": "paused", "animation-play-state": "paused"})
    score();
  };

  //game waits for user input before initiating
  var gameWait = function() {
    setTimeout(function() {
    muricaMusic.stop();
    },700); // extra stop here in case user clicks reset before music is loaded on score screen
    mexicanMusic.play();
    $usa.hide();
    $scoreScreen.hide();
    $character.css({ top: characterInitialTop, left: characterInitialLeft })
    if (started == false) {
      bounce = setInterval(function() {
        $character.effect("bounce", { times: 1 }, 1000); //adds a floating effect to the character
        $pressPlay.effect("pulsate", { times: 0.5 }, 1000); //adds a flashing effect to press play text like in retro games
      }, 1000);
    }
  }

  //this function is for listening to user hitting spacebar
  var movementEvent = function (e) {
    if (e.keyCode == keycode || e.type == 'click') {
      //how many times the character moves - multiplies the position.top below. higher value produces smoother movement but longer animations
      characterMovement += characterMovementIncrease;
      if (started == false) {
        clearInterval(bounce); //once user hits spacebar the bounce effect loop stops
        $character.stop(true, true); //stops all animation on character
        $character.appendTo($innerContainer); //jQuery UI effects places the character div into a wrapper div. this just places the character back in the correct place
        $(".ui-effects-wrapper").remove();
        $character.css({ top: characterInitialTop, left: characterInitialLeft }) //sets the starting position
        started = true;
        startGame();
      }
    }
  }

  $(document).on("keyup", movementEvent);
  $innerContainer.on('click', movementEvent);

//this function adds gravity to the character
  var gravity = function() {
    var position = $character.position();
    if (position.top > yMax - characterHeight) {
      characterMovement = 0;
    } else {
      //update this value to change gravity strength
      $character.css({ top: position.top + gravityIncrease });
    }
    if (characterMovement === 0) {
      //set zero state for rotation
      $character.css({ transform: "initial" });
    }
  };

  var moveCharacter = function() {
    var position = $character.position();
    if (characterMovement > 0 && position.top > yMin) {
      $character.css({
        // how high the character will fly
        // top: position.top - 0,
        //will rotate the character up when spacebar is pressed
        transform: "rotate(" + (2 - characterMovement) + "deg)"
      });
      characterMovement--;
    } else if (position.top <= yMin) {
      //character dies if he hits the bottom of the screen
      characterMovement = 0;
      isCharacterDead = true;
    }
  };

//creates new block elements
  var createBlock = function(blockClass) {
    var $newElem = $('<div></div>').addClass(blockClass); //adds a class to identify blocks at the top and bottom
    var rBlockHeight = randBlockHeight(); //block heights are randomly generated
    $innerContainer.append($newElem); //places the new block inside the inner container div
    $newElem.css({
      "left": xMax,
      "height": rBlockHeight
    }).animate({ //animates the block to move from right to left
      left: xMin - blockWidth
    }, {
      duration: blockSpeedDuration,
      easing: 'linear',
      complete: function() {
        $(this).remove(); //deletes block once animation is complete
        currScore += 1; //adds a score once the block completes animation
      },
      progress: function() { //collision detection below
        var characterPos        = $character.position();
        var cLeft               = characterPos.left;
        var cRight              = characterPos.left + characterWidth;
        var cTop                = characterPos.top;
        var cBot                = characterPos.top + characterHeight;

        var $block              = $(this);
        var blockPos            = $block.position();
        var blockHeight         = $block.height();

        var bLeft               = blockPos.left;
        var bRight              = blockPos.left + blockWidth;
        var bTop                = blockPos.top;
        var bBot                = blockPos.top + blockHeight;

        var horizontalCollision = cLeft < bRight && bLeft < cRight;
        //if the x position left side of the character is less than the x position of the right side of the box && the x position of the left side of the block is less than the x position of the right side of the character then there is a collision along the x axis
        var verticalCollision   = cTop < bBot && cBot > bTop;
        //if the y position of the top of the character is less than the y position of the bottom of the box && if the y position of the bottom of the character is greater than the y position of the top of the block then there is a vertical collision

        if (horizontalCollision && verticalCollision) {
          stopGame(); //game stops if collision is detected
        }
      }
    });
  };

//block generate parameters
  var blockGeneration = function() {
    currentBlockGenerationSpeed = Math.floor((Math.random() * 1000) + 400); //random number between 400 and 1000 milliseconds to randomise block generation
    durationTillNextBlock -= gameLoopDuration; //sets interval for next block
    if (durationTillNextBlock <= 0) {
      createBlock("blockTop"); //creates block with class blockTop
      createBlock("blockBottom"); //creates block with class blockBottom
      durationTillNextBlock = currentBlockGenerationSpeed;
    }
  };

//score screen and the animations/sounds it should play
  var score = function() {
    mexicanMusic.stop();
    var randText = (Math.random());
    if (randText <= 0.5){ //chooses between 2 different loser sounds/text
      $loserText.css({"background": "url('./images/greatWall.png')", "background-repeat": "no-repeat"});
      greatWall.play();
    } else {
      $loserText.css({"background": "url('./images/tallerWall.png')", "background-repeat": "no-repeat"});
      trump10ftTall.play();
    }
    setTimeout(function() { //slight delay to let the first sound to finish playing
      muricaMusic.play();
    }, 1500);
    $trump.animate({left: 280}, 300, "linear");
    $loserText.animate({left: 25}, 150, "linear");
    var actualScore = currScore / 2;
    $scoreScreen.show();
    $playerScore.html('<h1 class="scoreText">' + actualScore + '</h1>');
    //push actualScore to bestScore array, return highest score
    bestScore.push(actualScore);
    var maxScore = Math.max.apply(Math, bestScore);
    $bestScore.html('<h1 class="scoreText">' + maxScore + '</h1>');
    $restartBtn.off().on("click", resetGame);
  };

//resets the game parameters and variables back to initial state
  var resetGame = function() {
    $ground.css({"-webkit-animation-play-state": "running",
                         "animation-play-state": "running"});
    $background.css({"-webkit-animation-play-state": "running",
                             "animation-play-state": "running"});
    $trump.css({left: 1000});
    $loserText.css({left: -500});
    var $blockTop = $(".blockTop");
    var $blockBottom = $(".blockBottom");
    $blockTop.remove();
    $blockBottom.remove();
    currScore = 0;
    isCharacterDead = false;
    characterMovement = 0;
    started = false;
    $character.css({ transform: "initial" });
    $startScreen.show();
    muricaMusic.stop();
    gameWait();
  };

  var startGame = function() {
    $startScreen.hide();
    $usa.css({left:0});
    $usa.show().animate({left: 1000}, 2000, "linear");
    //gameLoop loops functions that require to be run ~60 times per second
    gameLoop = setInterval(function() {
      var position = $character.position();
      if (position.top >= yMax - characterHeight) {
        stopGame();
      } else if (started) {
        gravity();
        moveCharacter();
      }
      blockGeneration();
    }, gameLoopDuration);
  };
  //loop end
  gameWait();
});
