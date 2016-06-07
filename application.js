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
  var gameLoop = null;
  var blockLoop = null;
  var $character = $("#character");
  var characterMovement = 0;
  var $background = $("#background");
  var $innerContainer = $("#innerContainer");
  var randomInt = Math.floor((Math.random() * 3000) + 500);

  // var bgXScroll = 0;

  $(document).on("keyup", function(e) {
    if (e.keyCode == 32) {
      //how many times the character moves - multiplies the position.top below. higher value produces smoother movement but longer animations
      characterMovement += 20;
    }
  });

  var gravity = function() {
    var position = $character.position();
    if (position.top > 528) {
      characterMovement = 0;
      //game over screen
    } else {
      //update this value to change gravity strength
      $character.css({ top: position.top + 6 });
    }
    if (characterMovement === 0) {
      //set zero state for rotation
      $character.css({ transform: "initial" });
    }
  };

  var moveCharacter = function() {
    var position = $character.position();
    if (characterMovement > 0 && position.top > 0) {
      $character.css({
        //how high the character will fly
        // top: position.top - 0,
        //will rotate the character up when spacebar is pressed
        transform: "rotate(" + (1 * (2 - characterMovement)) + "deg)"
      });
      characterMovement--;
    } else if (position.top <= 0) {
      characterMovement = 0;
    }
  };

  var createBlockTop = function() {
    var $newElem = $('<div></div>').addClass("blockTop")
    $innerContainer.append($newElem);
    var $blockTop = $(".blockTop");
    $blockTop.css({
      marginLeft: "1000px"
    }).animate({
      left: "-=1100"
    }, {
      duration: 3000,
      easing: 'linear'
    });
      // .css to set the inital location
      // $newElem.
      // .animate to set the ending location
  };

  var createBlockBottom = function() {
    var $newElem = $('<div></div>').addClass("blockBottom")
    $innerContainer.append($newElem);
    var $blockBottom = $(".blockBottom");
    $blockBottom.css({
      marginLeft: "1000px"
    }).animate({
      left: "-=1100"
    }, {
      duration: 3000,
      easing: 'linear'
    });
  };

  var scroll = function(el, speed) {
    //scrolls the background, time controls the speed
    el.animate({ "background-position": "-1000px" }, speed, 'linear', function() {
      el.css('background-position', '0');
      scroll(el, speed);
    });
  }


  var collision = function() {
    var $characterPos = $character.position();
    var $blockTopPos = $blockTop.position();
    var $blockBottomPos = $blockBottom.position();


  }






  //this function stops the animations and generation of blocks
  var stopGame = function() {
    var $blockTop = $(".blockTop");
    var $blockBottom = $(".blockBottom");
    $blockTop.stop();
    $blockBottom.stop();
    $background.stop(true);
    clearInterval(blockLoop);
  }


  var startGame = function() {
    $character.css({ top: 30, left: 80 });
    //gameLoop loops functions that require to be run ~60 times per second
    gameLoop = setInterval(function() {
      var position = $character.position();
      if (position.top >= 528) {
        stopGame();
      } else {
        gravity();
        moveCharacter();
        scroll($background, 60000);
      }
    }, 17);

    blockLoop = setInterval(function() {
      var position = $character.position();
      createBlockTop();
      createBlockBottom();
    }, randomInt);
  };

  startGame();
});
