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
*/

$(document).ready(function() {
  // Invertal Variables
  var gameLoop  = null;

  // HTML elements
  var $character      = $("#character");
  var $background     = $("#background");
  var $innerContainer = $("#innerContainer");

  // System Variable
  var characterMovement           = 0;
  var currentBlockGenerationSpeed = 1000;
  var durationTillNextBlock       = currentBlockGenerationSpeed;

  // Default Settings
  var characterMovementIncrease = 20;
  var keycode                   = 32; // Keycode for Spacebar

  // Game Settings
  var characterHeight          = 72;
  var characterWidth           = 69;
  var characterInitialTop      = 30;
  var characterInitialLeft     = 80;
  var xMin                     = 0;
  var xMax                     = 1000;
  var yMin                     = 0;
  var yMax                     = 600;
  var gravityIncrease          = 6;
  var blockWidth               = 80;
  var blockSpeedDuration       = 3000;
  var backgroundScrollDuration = 60000;
  var gameLoopDuration         = 17;

  var randomInt = function () {
    return Math.floor((Math.random() * 3000) + 500);
  };

  //this function stops the animations and generation of blocks
  var stopGame = function() {
    var $blockTop = $(".blockTop");
    var $blockBottom = $(".blockBottom");
    $blockTop.stop();
    $blockBottom.stop();
    $background.stop(true);
    clearInterval(gameLoop);
  };

  $(document).on("keyup", function(e) {
    if (e.keyCode == keycode) {
      //how many times the character moves - multiplies the position.top below. higher value produces smoother movement but longer animations
      characterMovement += characterMovementIncrease;
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
      characterMovement = 0;
    }
  };

  var createBlock = function (blockClass) {
    var $newElem = $('<div></div>').addClass(blockClass);
    $innerContainer.append($newElem);
    $newElem.css({
      left: xMax
    }).animate({
      left: xMin - blockWidth
    }, {
      duration: blockSpeedDuration,
      easing: 'linear',
      complete: function () {
        $(this).remove();
      },
      progress: function () {
        var characterPos = $character.position();
        var cLeft        = characterPos.left;
        var cRight       = characterPos.left + characterWidth;
        var cTop         = characterPos.top;
        var cBot         = characterPos.top + characterHeight;

        var $block       = $(this);
        var blockTopPos  = $block.position();
        var blockHeight  = $block.height();
        var bLeft        = blockTopPos.left;
        var bTop         = blockTopPos.top;
        var bBot         = blockTopPos.top + blockHeight;

        // cLeft < bLeft < cRight
        var horizontalCollision = cLeft <= bLeft && bLeft <= cRight;

        // bTop < cTop < bBot
        // bTop < cBot < bBot
        var vertialCollisionTop = bTop <= cTop && cTop <= bBot ;
        var vertialCollisionBot = bTop <= cBot && cBot <= bBot ;

        if (horizontalCollision && vertialCollisionTop && vertialCollisionBot) {
          stopGame();
        }
      }
    });
  };

  var scroll = function(el, speed) {
    //scrolls the background, time controls the speed
    el.animate({ "background-position": "-1000px" }, speed, 'linear', function() {
      el.css('background-position', '0');
      scroll(el, speed);
    });
  };

  var blockGeneration = function () {
    durationTillNextBlock -= gameLoopDuration;

    if (durationTillNextBlock <= 0) {
      // [300, 200]
      createBlock("blockTop");
      createBlock("blockBottom");
      durationTillNextBlock = currentBlockGenerationSpeed;
    }
  };

  var startGame = function() {
    $character.css({ top: characterInitialTop, left: characterInitialLeft });

    //gameLoop loops functions that require to be run ~60 times per second
    gameLoop = setInterval(function() {
      var position = $character.position();
      if (position.top >= yMax - characterHeight) {
        stopGame();
      } else {
        gravity();
        moveCharacter();
        scroll($background, backgroundScrollDuration);
      }

      blockGeneration();
    }, gameLoopDuration);
  };

  startGame();
});
