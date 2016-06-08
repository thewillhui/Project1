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
  6.1 If character hit box hits the same position as a block then stop
7. Title screen
  7.1. Character floats waiting for user input. Game starts on user input
*/

$(document).ready(function() {
  // Interval Variables
  var gameLoop = null;
  var bounce = null;

  // HTML elements
  var $character = $("#character");
  var $background = $("#background");
  var $ground = $("#ground");
  var $innerContainer = $("#innerContainer");
  var $startScreen = $("#startScreen");
  var $pressPlay = $("#pressPlay");
  var $scoreScreen = $("#scoreScreen");
  var $playerScore = $("#playerScore");
  var $bestScore = $("#bestScore");

  // System Variable
  var characterMovement = 0;
  var currentBlockGenerationSpeed = 700;
  var durationTillNextBlock = currentBlockGenerationSpeed;

  // Default Settings
  var characterMovementIncrease = 20;
  var keycode = 32; // Keycode for Spacebar
  var started = false;
  var isCharacterDead = false; //check if character is dead used for score function

  // Game Settings
  var characterHeight = 72;
  var characterWidth = 69;
  var characterInitialTop = 220;
  var characterInitialLeft = 80;
  var xMin = 0;
  var xMax = 1000;
  var yMin = 0;
  var yMax = 600;
  var gravityIncrease = 6;
  var blockWidth = 80;
  var blockSpeedDuration = 2000;

  var backgroundScrollDuration = 50000;
  var groundScrollDuration = 20000;
  var gameLoopDuration = 17;

  //Sounds and music
  var mexicanMusic = new buzz.sound("./sounds/mexicanAnthem8.mp3", {preload:true, loop: true});
  var muricaMusic = new buzz.sound("./sounds/usaAnthem8.mp3", {preload:true, loop: true});
  var trump10ftTall = new buzz.sound("./sounds/trump10ftTaller.mp3", {preload:true, loop: false});

  //Scoring
  var player;
  var bestScore = [];
  var currScore = 0;


  //Random height generator for the blocks
  var randBlockHeight = function() {
    return Math.floor((Math.random() * 230) + 150);
  };

  //Random interval generator for block generation frequency
  var randomInt = function() {
    return Math.floor((Math.random() * 3000) + 500);
  };

  //this function stops the animations and generation of blocks
  var stopGame = function() {
    isCharacterDead = true;
    score();
    var $blockTop = $(".blockTop");
    var $blockBottom = $(".blockBottom");
    $blockTop.stop();
    $blockBottom.stop();
    $background.stop(true);
    $ground.stop(true);
    clearInterval(gameLoop);
  };

  //game waits for user input before initiating
  var gameWait = function() {
    mexicanMusic.play()
    scroll($ground, groundScrollDuration);
    scroll($background, backgroundScrollDuration);
    $scoreScreen.hide();
    $character.css({ top: characterInitialTop, left: characterInitialLeft })
    if (started === false) {
      bounce = setInterval(function() {
        $character.effect("bounce", { times: 1 }, 1000);
        $pressPlay.effect("pulsate", { times: 0.5 }, 1000);
      }, 1000);
    }
  }

  $(document).on("keyup", function(e) {
    if (e.keyCode == keycode) {
      //how many times the character moves - multiplies the position.top below. higher value produces smoother movement but longer animations
      characterMovement += characterMovementIncrease;
      if (started == false) {
        started = true;
        $character.stop();
        clearInterval(bounce);
        startGame();
      }
    }
  });

  var gravity = function() {
    var position = $character.position();
    if (position.top > yMax - characterHeight) {
      characterMovement = 0;
      //game over screen
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

  var createBlock = function(blockClass) {
    var $newElem = $('<div></div>').addClass(blockClass);
    var rBlockHeight = randBlockHeight();
    $innerContainer.append($newElem);
    $newElem.css({
      left: xMax,
      height: rBlockHeight
    }).animate({
      left: xMin - blockWidth
    }, {
      duration: blockSpeedDuration,
      easing: 'linear',
      complete: function() {
        $(this).remove();
        currScore += 1;
      },
      progress: function() {
        var characterPos = $character.position();
        var cLeft = characterPos.left;
        var cRight = characterPos.left + characterWidth;
        var cTop = characterPos.top;
        var cBot = characterPos.top + characterHeight;

        var $block = $(this);
        var blockPos = $block.position();
        var blockHeight = $block.height();

        var bLeft = blockPos.left;
        var bRight = blockPos.left + blockWidth;
        var bTop = blockPos.top;
        var bBot = blockPos.top + blockHeight;

        // cLeft < bLeft < cRight
        var horizontalCollisionL = cLeft <= bLeft && bLeft <= cRight;
        var horizontalCollisionR = cRight <= bRight && bLeft <= cRight;

        // bTop < cTop < bBot
        // bTop < cBot < bBot
        var verticalCollisionTop = bTop <= cTop && cTop <= bBot;
        var verticalCollisionBot = bTop <= cBot && cBot <= bBot;

        if (horizontalCollisionL && horizontalCollisionR && verticalCollisionTop && verticalCollisionBot) {

          stopGame();

        }
      }
    });
  };



  var scroll = function(el, speed) {
    //scrolls the background, time controls the speed
    el.animate({ "background-position": "-" + 1000 + "px" }, speed, 'linear', function() {
      //resets background back to 0
      el.css('background-position', '0');
      scroll(el, speed);
    });
  };

  var blockGeneration = function() {
    durationTillNextBlock -= gameLoopDuration;

    if (durationTillNextBlock <= 0) {
      // [300, 200]
      createBlock("blockTop");
      createBlock("blockBottom");
      durationTillNextBlock = currentBlockGenerationSpeed;
    }
  };

  window.score = function() {
    mexicanMusic.stop();
    trump10ftTall.play();
    muricaMusic.play().fadeIn(4).loop(true);
    var actualScore = currScore/2;
    $scoreScreen.show();
    $playerScore.append('<h1 class="scoreText">' + actualScore + "</h1>");
    //append currScore to bestScore array, return highest score
    bestScore.push(actualScore);
    var maxScore = Math.max.apply(Math, bestScore);
    $bestScore.append('<h1 class="scoreText">' + maxScore + "</h1>");
    console.log(actualScore)
  };



  var startGame = function() {
    $startScreen.hide();
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
    // score();
  };
  //loop end
  gameWait()
});
