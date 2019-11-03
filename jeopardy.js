window.onload = scriptMain;
var jeopardy = [];
var loadingCircles;
var clueDiv;
var clueRow;
var clueColumn;
var clueButtons;
var dataFound = false;
var angle = 0;
var score = 0;
var z;
var timeLeft;
var numberCorrect = 0;
var numberWrong = 0;
clueDiv = document.createElement("div");
var answerBox;
answerBox = document.createElement("div");
for (var i=0; i < 6; i++) {
  jeopardy.push([]);
  for(var j=0; j<5; j++) {
    if(i!=0) {
      jeopardy[i].push({});
    }
  }
}

function scriptMain() {
  const loadingScreen = document.getElementById("loadingScreen");
  const ctx = loadingScreen.getContext('2d');
  initCanvas(loadingScreen, ctx);
  var p = new Promise(function(reject, resolve) {
    displayGrid();
    var x = setInterval(function() {
      displayLoadScreen(ctx);
      console.log(dataFound);
      if(dataFound) {
        loadingScreen.style.visibility = "hidden";
        clearInterval(x);
        // clearInterval(y);
        resolve();
       
      }
      // reject("hey!");
    }, 5);
  });

  p.then(function() {
    console.log("hey!");
   
  }).catch(function() {
    createJeopardyGrid();
  });

  //move to init function
  clueButtons = document.createElement("div");
  clueButtons.id = "clueButtons";
  var rightButton = document.createElement("div");
  rightButton.id = "rightButton";
  rightButton.textContent = "I was right!"
  rightButton.addEventListener('click', correct);
  var wrongButton = document.createElement("div");
  wrongButton.id = "wrongButton";
  wrongButton.textContent = "I was wrong."
  wrongButton.addEventListener('click', wrong);
  clueButtons.appendChild(wrongButton);
  clueButtons.appendChild(rightButton);

}
  // document.body.style.background = "blue";

  async function displayGrid() {
    var increment = 0;
    var value = 0;
    while (increment < 5) {
      var genRandom = Math.floor(Math.random() * 18419);

      var result = await fetch('https://cors-anywhere.herokuapp.com/http://jservice.io/api/category?/&id=' + String(genRandom));


//console.log(result);
     // Examine the text in the response
     var data = await result.json()
     //console.log(JSON.stringify(data));
     if(JSON.stringify(data['clues_count']) >= 5 && JSON.stringify(data).includes('"value":200') && JSON.stringify(data).includes('"value":400') && JSON.stringify(data).includes('"value":600') && JSON.stringify(data).includes('"value":800') && JSON.stringify(data).includes('"value":1000'))
     {
      jeopardy[0][increment] = (data['title']);
      var k = 0;
      while (k < data['clues_count']) {
        value = data['clues'][k]['value'];
        switch(value) {
          case 200:
          jeopardy[1][increment].clue = data['clues'][k]['question'];
          jeopardy[1][increment].answer = data['clues'][k]['answer'];
          jeopardy[1][increment].pointValue = value;
          break;
          case 400:
          jeopardy[2][increment].clue = data['clues'][k]['question'];
          jeopardy[2][increment].answer = data['clues'][k]['answer'];
          jeopardy[2][increment].pointValue = value;
          break;
          case 600:
          jeopardy[3][increment].clue = data['clues'][k]['question'];
          jeopardy[3][increment].answer = data['clues'][k]['answer'];
          jeopardy[3][increment].pointValue = value;
          break;
          case 800:
          jeopardy[4][increment].clue = data['clues'][k]['question'];
          jeopardy[4][increment].answer = data['clues'][k]['answer'];
          jeopardy[4][increment].pointValue = value;
          break;
          case 1000:
          jeopardy[5][increment].clue = data['clues'][k]['question'];
          jeopardy[5][increment].answer = data['clues'][k]['answer'];
          jeopardy[5][increment].pointValue = value;
          break;
          default:
          console.log("None found!");
          break;
        } // end switch
       k++;

      } //end clues traverser
      increment++;
     
    } //end "if" filter condition
   
  } //end increment category
  dataFound = true;
  //createJeopardyGrid();
}
// console.log(jeopardy);

function createJeopardyGrid() {
  clueDiv.id = "clueDiv";
  document.body.appendChild(clueDiv);
  answerBox.textContent = "Show Answer";
  answerBox.id = "answerBox";
  answerBox.addEventListener('click', showAnswer);
  const nbrOfRows = 6;
  const nbrOfColumns = 5;
  var cell;
  var getGrid = document.getElementById("grid");
  for(var r=0; r<nbrOfRows; r++) {
    for(var c=0; c<nbrOfColumns; c++) {
      cell = document.createElement("div");

      if(r == 0) {
        cell.innerHTML = "<p>" + jeopardy[r][c].toUpperCase() + "</p>";
        cell.style.color = "white";
      } else {
        cell.style.cursor = "pointer";
        cell.innerHTML = "<p>" + 200*r + "</p>";
        cell.style.color = "white";
      }
      cell.addEventListener('click', showClue);
      cell.row = r;
      cell.column = c;
      cell.answered = false;
      getGrid.appendChild(cell);
    }
  }
  createScoreBar();
}
function createScoreBar() {
  const getGrid = document.getElementById("grid");
  var scoreBar = document.createElement("div");
  scoreBar.id = "scoreBar";
  //getGrid.style.background = "black";
  var correct = document.createElement("div");
  var wrong = document.createElement("div");
  var score = document.createElement("div");
  var backButton = document.createElement("div");
  backButton.id = "backButton";
  backButton.onclick = function() {
    window.location.assign("index.html");
  };
  correct.id = "correctBox";
  wrong.id = "incorrectBox";
  score.id = "scoreBox";
  backButton.textContent = "Return Home";
  correct.textContent = "Number Correct: 0";
  wrong.textContent = "Number Wrong: 0";
  score.textContent = "Current Score: 0";
  scoreBar.appendChild(backButton);
  scoreBar.appendChild(correct);
  scoreBar.appendChild(wrong);
  scoreBar.appendChild(score);
  getGrid.appendChild(scoreBar);

}
function showClue() {
  if (this.row != 0 && this.answered == false) {
    this.answered = true;
    this.innerHTML = "";
    clueDiv.style.visibility = "visible";
    clueDiv.innerHTML = jeopardy[this.row][this.column].clue.toUpperCase();
    buildTimer();
    clueDiv.appendChild(answerBox);
   
    clueRow = this.row;
    clueColumn = this.column;
    timeLeft = 11;

    // var test = document.createElement("div");
    // test.textContent = "we in here!";
    // test.style.border = "1px solid black";
    // clueDiv.appendChild(test);
    var ctx = document.getElementById("timer").getContext('2d');
    z = setInterval(function() {
        // // console.log(--timeLeft);
        // // timerBar.childNodes[Math.abs(5-timeLeft+1)].style.background = "black";
        // console.log(--timeLeft);
        // // timerBar.childNodes[9-Math.abs(5-timeLeft+1)].style.background = "black";
        drawTimer(ctx, --timeLeft);

        if(timeLeft==0) {
          // clearInterval(z); //make z global and allow interval to be cleared oninput
           showAnswer();
        }
    }, 1000);
 
  }
}

function showAnswer() {
  clearInterval(z);
  clueDiv.innerHTML = jeopardy[clueRow][clueColumn].answer.toUpperCase();
  clueDiv.appendChild(clueButtons);
 
  // if(timeLeft == 0) {
  //   score -=  jeopardy[clueRow][clueColumn].value;
  // } else {
  //   score +=  jeopardy[clueRow][clueColumn].value;
   
  // }
 

  // clueDiv.style.textAlign = "center";
}

function displayLoadScreen(ctx) {
  angle = angle + .1;
  ctx.clearRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight);
  ctx.beginPath();
  ctx.arc(50*Math.cos(angle), 50*Math.sin(angle), 10, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();                          
}

function initCanvas(canvas, ctx) {
  canvas.style.position = "absolute";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.translate(window.innerWidth/2,window.innerHeight/2);
  canvas.style.border = "1px solid black";
  ctx.strokeStyle = "white";
}


   

function buildTimer() {
    var timer = document.createElement("canvas");
    var ctx = timer.getContext('2d');
    timer.id = "timer";
    timer.width = 300;
    timer.height = 300;
    ctx.translate(150,150);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    var increment = 36*Math.PI/180;
    var prevAngle = 0;
    
    

    for(var i = 0; i < 10; i++) {
      ctx.beginPath();
      console.log(prevAngle);
      ctx.arc(0,0,75, prevAngle, (prevAngle + increment-.25));
      console.log(prevAngle+increment-.25);
      prevAngle = prevAngle + increment;
      console.log(prevAngle);
      ctx.stroke();
      ctx.closePath();
      
    }
    

    // const timerBar = document.createElement("div");
    // // timerBar.style.border = "1px solid black";
    // timerBar.id = "timerBar";
    // var div;
    // for(var i = 0; i<9; i++) {
    //     div = document.createElement("div");
    //     // div.textContent = "heyo";
    //     timerBar.appendChild(div);
       
    // }
    clueDiv.appendChild(timer);
}

function drawTimer(ctx, timeLeft) {
    ctx.clearRect(-150, -150, 300, 300);
    var increment = 36*Math.PI/180;
    var prevAngle = 0;
    
    

    for(var i = 0; i < timeLeft-1; i++) {
      ctx.beginPath();
      console.log(prevAngle);
      ctx.arc(0,0,75, prevAngle, (prevAngle + increment-.25));
      console.log(prevAngle+increment-.25);
      prevAngle = prevAngle + increment;
      console.log(prevAngle);
      ctx.stroke();
      ctx.closePath();
      
    }
}

function correct() {
  clueDiv.style.visibility = "hidden";
  score +=  jeopardy[clueRow][clueColumn].pointValue;
  document.getElementById("correctBox").textContent = "Number Right: " + (++numberCorrect);
  document.getElementById("scoreBox").textContent = "Score: " + score;
  if(numberCorrect + numberWrong == 25) {
    endGame();
  }
}

function wrong() {
  clueDiv.style.visibility = "hidden";
  // console.log(jeopardy[clueRow][clueColumn].value);
  score -=  jeopardy[clueRow][clueColumn].pointValue;
  document.getElementById("incorrectBox").textContent = "Number Wrong: " + (++numberWrong);
  document.getElementById("scoreBox").textContent = "Score: " + score;
  if(numberCorrect + numberWrong == 25) {
    endGame();
  }
}

function endGame() {
  console.log("heyo")
  var endGame = document.createElement("div");
  var endOptions = document.createElement("div");
  var returnHome = document.createElement("div");
  var playAgain = document.createElement("div");
  endOptions.id = "endOptions";
  returnHome.id = "returnHome";
  returnHome.addEventListener("click", function() {
    //link to the home page! aint it some location.replace type beat?
    window.location.assign("google.com");
  });
  returnHome.textContent = "Return Home"
  playAgain.id = "playAgain";
  playAgain.addEventListener("click", function() {
    window.location.reload();
  });
  playAgain.textContent = "Play Again";
  endOptions.appendChild(returnHome);
  endOptions.appendChild(playAgain);
  endGame.id = "endGame";
  var string = "Game Over<br>Number Correct: " + numberCorrect + "<br>Number Wrong: " + numberWrong + "<br>Score: " + score;
  endGame.innerHTML = string.toUpperCase();
  endGame.style.position = "fixed";
  endGame.appendChild(endOptions);
  document.body.appendChild(endGame);
}
