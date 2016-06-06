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
    5.1.1. Generate blocks with random attributes

*/
$(document).ready(function() {
  var gameLoop = null;
  var blockLoop = null;
  var $character = $("#character");
  var characterMovement = 0;
  var $background = $("#background");
  var randomInt = Math.floor((Math.random()*1000)+500);

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
    $background.append($newElem);
    var $blockTop = $(".blockTop");
    $newElem.css({ marginLeft: "1000px" }).animate({ left: "-=1100" }, 3000, function() {

        //animation complete
      })
      // .css to set the inital location
      // $newElem.
    // .animate to set the ending location
  };




  var createBlockBottom = function() {
  var $newElem = $('<div></div>').addClass("blockBottom")
    $background.append($newElem);
    var $blockTop = $(".blockBottom");
    $newElem.css({ marginLeft: "1000px" }).animate({ left: "-=1100" }, 3000, function() {

        //animation complete
      })

  };

  // var backgroundScroll = function() {
  //   var backgroundImage = $background.


  // };

  var startGame = function() {
    $character.css({ top: 30, left: 80 });

    //gameLoop loops functions that require to be run ~60 times per second
    gameLoop = setInterval(function() {
      gravity();
      moveCharacter();
      // backgroundScroll();
    }, 17);

    blockLoop = setInterval(function() {
      var position = $character.position();

      //blocks stop being created if the character falls to the bottom of the screen i.e. dies
      if (position.top >= 528) {
        clearInterval(blockLoop)
      } else {
        createBlockTop();
        createBlockBottom();
      }
    }, randomInt);

  };

  startGame();
});
