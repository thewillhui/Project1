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
  var $character = $("#character");
  var characterMovement = 0;
  var $background = $("#background");
  var $blockTop = $(".blockTop");
  var bgXScroll = 0;

  $(document).on("keypress", function(e) {
    if (e.keyCode == 32) {
      //how many times the character moves - multiplies the position.top below. higher value produces smoother movement but longer animations
      characterMovement += 20;
    }
  });

  var gravity = function () {
    var position = $character.position();
    if (position.top >528) {
      characterMovement = 0;
      //game over screen
    } else {
      //update this value to change gravity strength
      $character.css({top: position.top + 6});
    }

    if (characterMovement === 0) {
      $character.css({transform: "initial"});
    }
  };

  var moveCharacter = function () {
    var position = $character.position();
    if (characterMovement > 0 && position.top > 0) {
      $character.css({
        top: position.top - 2,
        //will rotate the character up when spacebar is pressed
        transform: "rotate(" + (2 * (3 - characterMovement)) +"deg)"
      });
      characterMovement--;
    } else if (position.top <= 0) {
      characterMovement = 0;
    }
  };

  var createBlockTop = function(){
    var $newElem = $('<div class="blockTop"></div>')
    $container.append($newElem);

    // .css to set the inital location
    // $newElem.


    // .animate to set the ending location
  }

  var blockTopMove = function() {
    var position = $blockTop.position();
    $blockTop.css({left: 600})
    $blockTop.css({left: position.left - 2});
  }


  var createBlockBottom = function(){


  }

  // var backgroundScroll = function() {
  //   var position = $background.position();
  //   bgXScroll--;
  //   console.log(bgXScroll)
  //   $background.animate("background-position", "0 bgXScroll");

  // }

  var startGame = function () {
    $character.css({top: 30, left: 80});
    gameLoop = setInterval(function() {
      gravity();
      moveCharacter();
      // backgroundScroll();
      // blockTopMove();
    }, 17);
    // createBlockTop();
  };

  startGame();
});
