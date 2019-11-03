window.onload = scriptMain;
var i = 0;
var ctgryid = 0;
var listofcat = [];
var getbuttn1;
var getdifficult;
var getAnswer;
var getBackBtn;
var getStartDate;
var getEndDate;
var keywordBox;
var keyword;
var counter = 0;
var questions = [];
var answers = [];
var categories = [];
if (document.cookie != "") {
  var favQuestions = JSON.parse(getCookie("favQuestions"));
  var favAnswers = JSON.parse(getCookie("favAnswers"));
  var favCategories = JSON.parse(getCookie("favCategories"));
} else {
  var favQuestions = [];
  var favAnswers = [];
  var favCategories = [];
}
var getNextQuest;
var insideFindMore = false;
var noMoreQuestions = false;
var exitingFavorites = false;
var endFavorites = false;
var insideFavorites = false;
var noFavorites = false;
var getRandom = false;
var rndmNums = [];


// scriptMain: function is called onload and deals with all of the basic docuent styling and page setup
function scriptMain() {
  pageSetup();

}

// pageSetup: deals with creating event listeners for all of the buttons on the page
function pageSetup() {
  getTitle = document.getElementById("title");
  getTitle.onclick = function() {
    window.location.assign("index.html");
  };
  getbuttn1 = document.getElementById("playbtn");
  getdifficult = document.getElementById("difficulty");
  getAnswer = document.getElementById("answerbtn");
  getBackBtn = document.getElementById("backBtn");
  getStartDate = document.getElementById("searchDate")
  getEndDate = document.getElementById("searchDate1")
  keywordBox = document.getElementById("keyword");
  getNextQuest = document.getElementById("nextQuest");
  getFavQuest = document.getElementById("favQuest");

  // Deals with the favoriting of questions through JavaScript cookies
  getFavQuest.addEventListener('click', function() {
    resetItems();
    insideFavorites = true;
    if (this.innerHTML == "Exit Favorites") {
      exitingFavorites = true;
      displayNoMatches();
      this.innerHTML = '<i id="heartbtn" title="Favorites!" class="fa fa-heart"></i>';
    } else {
      setCookie("favQuestions", JSON.stringify(favQuestions), 30);
      setCookie("favAnswers", JSON.stringify(favAnswers), 30);
      setCookie("favCategories", JSON.stringify(favCategories), 30);
      console.log("documented favorite question cookie: " + getCookie("favQuestions"));
      if (getCookie("favQuestions") == "[]") {
        noMoreQuestions = false;
        noFavorites = true;
        //alert("nothing found!");
        displayNoMatches();
      } else {
        //resetItems();
        questions = JSON.parse(getCookie("favQuestions"));
        answers = JSON.parse(getCookie("favAnswers"));
        categories = JSON.parse(getCookie("favCategories"));
        displayQuestion(questions, counter);
        this.innerHTML = "Exit Favorites";


      }
    }
  })

  // Deals with the functionalities that come when the user clicks the next question button
  getNextQuest.addEventListener('click', async function() {
    var getFavorite = document.getElementById("favoritesbtn");
    getFavorite.style.color = "white";

    if (insideFindMore && !insideFavorites) {
      //console.log("retrieveData being recursively called");
      await retrieveData();
    }

    if (counter <= questions.length - 1) {
      //console.log("The counter is being incremented");
      counter++;
    }

    if (getBackBtn.disabled) {
      getBackBtn.disabled = false;
    }

    if (getAnswer.innerHTML == "Show Clue") {
      getAnswer.innerHTML = "Check Answer";
    }


    //console.log("Just right before the question is displayed");


    if (counter == questions.length && counter != 0) {
      getBackBtn.disabled = true;
      if (insideFavorites) {
        noMoreQuestions = false;
        endFavorites = true;
        //console.log("so we basically in here!");
        displayNoMatches();
        getFavQuest.innerHTML = '<i id="heartbtn" title="Favorites!" class="fa fa-heart"></i>';
      } else {
        noMoreQuestions = true;
        displayNoMatches();
      }
    } else if (counter == questions.length && counter == 0) {
      getBackBtn.disabled = true;
      noMoreQuestions = false;
      displayNoMatches();
    } else {
      displayQuestion(questions, counter);
    }


  })

  // Resets all variables and begins new search on click
  getbuttn1.addEventListener('click', function() {
    resetItems();
    retrieveData();
  })

  // Deals with the toggling of the current question and corresponding answer
  getAnswer.addEventListener('click', function() {
    if (document.getElementById("questionText").innerHTML.includes("Clue:")) {
      document.getElementById("answerbtn").innerHTML = "Check Answer";
      displayAnswer(answers, counter);
      document.getElementById("answerbtn").innerHTML = "Show Clue";
    } else {
      document.getElementById("answerbtn").innerHTML = "Show Clue";
      displayQuestion(questions, counter);
      document.getElementById("answerbtn").innerHTML = "Check Answer";

    }

  })

  // Deals with the user going back to previous questions
  getBackBtn.addEventListener('click', function() {
    counter--;

    if (counter == 0) {
      this.disabled = true;
    }

    if (getAnswer.innerHTML == "Show Clue") {
      getAnswer.innerHTML = "Check Answer";
    }

    displayQuestion(questions, counter);

  })

  // Displays all of the categories relating to the user's keyword search in a dropdown
  keywordBox.addEventListener('input', function() {
    if (this.value.length >= 3) {
      for (var i = 0; i < FINALARRAY.length; i++) {
        var catArr = FINALARRAY[i]['categoryName'].split(" ");
        if (catArr.includes(this.value.toLowerCase())) {
          var opt = document.createElement('option');
          opt.innerHTML = titleCase(FINALARRAY[i]['categoryName']);
          var getDataList = document.getElementById("categoryValues");
          getDataList.appendChild(opt);

        }
      }
    }
    try {
      [].slice.call(getDataList.options)
        .map(function(a) {
          if (this[a.value]) {
            getDataList.removeChild(a);
          } else {
            this[a.value] = 1;
          }
        }, {});
    } catch (error) {

    }
  })
}


// retrieveData: Pulls the corresponding questions from the jservice API based off of the user's search
async function retrieveData() {

  keyword = document.getElementById("keyword").value;
  difficulty = document.getElementById("difficulty").value;
  startDate = document.getElementById("searchDate").value;
  endDate = document.getElementById("searchDate1").value;

  if (keyword != "") {
    insideFindMore = false;
    questions = [];
    answers = [];
    counter = 0;
  }
  var j = 0;
  if (keyword != "") {
    while (j < FINALARRAY.length) {
      if ((FINALARRAY[j].categoryName).toLowerCase() == (keyword.toLowerCase()).trim()) {
        ctgryid = FINALARRAY[j].id;
        console.log(ctgryid);
        listofcat.push(ctgryid);
      }
      j++;
    }

    while (i < listofcat.length) {
      if (difficulty != "Random" && keyword != "" && startDate == "" && endDate == "") {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&category=' + String(listofcat[i]) + "&value=" + String(difficulty));

      } else if (keyword != "" && difficulty == "Random" && startDate == "" && endDate == "") {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&category=' + String(listofcat[i]));

      } else if (keyword != "" && startDate != "" && endDate != "" && difficulty == "Random") {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&category=' + String(listofcat[i]) + "&min_date=" + String(startDate) + "&max_date=" + String(endDate));

      } else {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&category=' + String(listofcat[i]) + "&min_date=" + String(startDate) + "&max_date=" + String(endDate) + "&value=" + String(difficulty));

      }
      i++;
    }
  } else {
    if (difficulty != "Random" && keyword == "" && startDate == "" && endDate == "") {
      insideFindMore = true;
      var genRandom = generateRandomCategory();
      await generateRandomResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&value=' + String(difficulty) + "&category=", genRandom);

    } else if (difficulty != "Random" && keyword == "" && startDate !== "" && endDate !== "") {
      if (endDate.substring(0, 4) - startDate.substring(0, 4) >= 10) {
        insideFindMore = true;
        var genRandom = generateRandomCategory();
        await generateRandomResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&min_date=' + String(startDate) + "&max_date=" + String(endDate) + "&value=" + String(difficulty) + "&category=", genRandom);
      } else {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&min_date=' + String(startDate) + "&max_date=" + String(endDate) + "&value=" + String(difficulty));
      }

    } else if (difficulty == "Random" && keyword == "" && startDate !== "" && endDate !== "") {
      if (endDate.substring(0, 4) - startDate.substring(0, 4) >= 10) {
        insideFindMore = true;
        var genRandom = generateRandomCategory();
        await generateRandomResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&min_date=' + String(startDate) + "&max_date=" + String(endDate) + "&category=", genRandom);
      } else {
        await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/clues?/&min_date=' + String(startDate) + "&max_date=" + String(endDate));
      }

    } else if (keyword == "" && difficulty == "Random" && keyword == "" && startDate == "" && endDate == "") {
      insideFindMore = true;
      getRandom = true;
      await grabResults('https://cors-anywhere.herokuapp.com/http://jservice.io/api/random');
    }
  }

  if (!getRandom) {
    filterResults();
  }

  //console.log(questions.length + ", " + answers.length + ", " + categories.length);

  if (counter == 0) {
    displayQuestion(questions, counter);
  }
}


// displayQuestion: Displays the question based off of the questions and corresponding value of the counter (global so parameters not needed but passed just in case)
function displayQuestion(clue, index) {
  if (favQuestions.includes(questions[counter])) {
    document.getElementById("favoritesbtn").style.color = "red";
  } else {
    document.getElementById("favoritesbtn").style.color = "white";
  }
  if (questions.length > 0) {
    var getBox = document.getElementById("questionBox");
    getBox.style.visibility = "visible";
    document.getElementById("questionText").innerHTML = "Clue: " + (clue[index].slice(1, -1).replace(/\\"/g, '"')).trim();
    document.getElementById("catTitle").innerHTML = "CATEGORY: " + categories[index].slice(1, -1).replace(/\\"/g, '"').trim().toUpperCase();
  } else if (questions.length == 0) {
    noMoreQuestions = false;
    displayNoMatches();
  }


}

// displayAnswer: Displays the answer based off of the answers and corresponding value of the counter (global so parameters not needed but passed just in case)
function displayAnswer(clue, index) {
  var getBox = document.getElementById("questionBox");
  document.getElementById("questionText").innerHTML = (clue[index].slice(1, -1).replace(/\\"/g, '"')).trim();
}


// displayNoMatches: Contains all the possible pop up messages that can occur during the user's experience. Also hides and disables all question related elements
function displayNoMatches() {
  if (noMoreQuestions) {
    var getMsg = document.getElementById("message");
    getMsg.innerHTML = "There are currently no more questions left. Perhaps a different category! " + ' <button id="close">&#10060</button>';
  } else if (exitingFavorites) {
    var getMsg = document.getElementById("message");
    getMsg.innerHTML = "Feel free to check out your favorites at a later time! " + ' <button id="close">&#10060</button>';
  } else if (endFavorites) {
    var getMsg = document.getElementById("message");
    getMsg.innerHTML = "You have reached the end of your favorites. Perhaps try to add some new ones! " + ' <button id="close">&#10060</button>';

  } else if (noFavorites) {
    var getMsg = document.getElementById("message");
    getMsg.innerHTML = "You currently have no favorited questions. Try looking for some! " + ' <button id="close">&#10060</button>';
  } else {
    var getMsg = document.getElementById("message");
    getMsg.innerHTML = "No matches found. Please try refining your search! " + ' <button id="close">&#10060</button>';
  }
  //console.log("We have reached inside here!");
  var biggerDiv = document.getElementById("biggerDiv");
  biggerDiv.style.opacity = 0.25;
  var getBut1 = document.getElementById("keyword");
  getBut1.disabled = true;
  var getBut2 = document.getElementById("searchDate");
  getBut2.disabled = true;
  var getBut3 = document.getElementById("searchDate1");
  getBut3.disabled = true;
  var getBut4 = document.getElementById("difficulty");
  getBut4.disabled = true;
  var getBut5 = document.getElementById("playbtn");
  getBut5.disabled = true;
  var getQuestBox = document.getElementById("questionBox");
  getQuestBox.style.visibility = "hidden";
  var getPopup = document.getElementById("popup");
  getPopup.style.left = (0.5 * (window.innerWidth - getPopup.offsetWidth)) + "px";
  getPopup.style.visibility = "visible";
  getX = document.getElementById("close");
  getX.onclick = function() {
    var getBut1 = document.getElementById("keyword");
    getBut1.disabled = false;
    var getBut2 = document.getElementById("searchDate");
    getBut2.disabled = false;
    var getBut3 = document.getElementById("searchDate1");
    getBut3.disabled = false;
    var getBut4 = document.getElementById("difficulty");
    getBut4.disabled = false;
    var getBut5 = document.getElementById("playbtn");
    getBut5.disabled = false;
    var biggerDiv = document.getElementById("biggerDiv");
    biggerDiv.style.opacity = 1;
    var getPopup = document.getElementById("popup");
    getPopup.style.visibility = "hidden";
  }

}

// resetItems: Resets all global variables
function resetItems() {
  noMoreQuestions = false;
  exitingFavorites = false;
  endFavorites = false;
  insideFavorites = false;
  noFavorites = false;
  genRandom = false;
  //console.log("noMoreQuestions is: " + noMoreQuestions);
  questions = [];
  answers = [];
  categories = [];
  counter = 0;
  rndmNums = [];
  var getQuestBox = document.getElementById("questionBox");
  getQuestBox.style.visibility = "hidden";
  getBackBtn = document.getElementById("backBtn");
  getBackBtn.disabled = true;
  document.getElementById("answerbtn").innerHTML = "Check Answer";
  //console.log("Everything is being reset");
}

// filterResults: Filters the questions and answers array for any repeats and empty strings
function filterResults() {
  if (questions.includes('""')) {
    var badQuestionsIndex = [];
    var l = 0;
    while (l < questions.length) {
      if (questions[l] == '""') {
        badQuestionsIndex.push(l);
      }
      l++;
    }

    //console.log("badQuestionsIndex: " + badQuestionsIndex);
    var j = 0;
    var k = 0;
    for (var i = badQuestionsIndex.length - 1; i >= 0; i--)
      questions.splice(badQuestionsIndex[i], 1);

    for (var i = badQuestionsIndex.length - 1; i >= 0; i--)
      answers.splice(badQuestionsIndex[i], 1);

    for (var i = badQuestionsIndex.length - 1; i >= 0; i--)
      categories.splice(badQuestionsIndex[i], 1);
  } else if (!getRandom) {
    var duplicatedIndexes = [];
    for (var i = questions.length - 1; i >= 0; i--) {
      var curr = questions[i];
      for (var j = i - 1; j >= 0; j--) {
        if (questions[j] == curr) {
          duplicatedIndexes.push(j);
          questions.splice(j, 1);

        }
      }
    }

    for (var r = 0; r < duplicatedIndexes.length; r++) {
      answers.splice(duplicatedIndexes[r], 1);
      categories.splice(duplicatedIndexes[r], 1);
    }

  }

}


// generateRandomCategory: Generates a uniqe random number to be used as a search field
function generateRandomCategory() {
  var rand = Math.floor(Math.random() * 18418) + 1;
  while (rndmNums.includes(rand)) {
    rand = Math.floor(Math.random() * 18418) + 1;
  }
  rndmNums.push(rand);
  return rand;
}

// grabResults: Grabs results from the API based off of the given link
async function grabResults(link) {
  var result = await fetch(link);
  var data = await result.json();
  var k = 0;
  if (getRandom) {
    console.log(JSON.stringify(data));
    while (JSON.stringify(data[0]['question']) == '""') {
      var result = await fetch(link);
      var data = await result.json();
    }

    while (k < data.length) {
      questions.push(JSON.stringify(data[k]['question']));
      answers.push(JSON.stringify(data[k]['answer']));
      categories.push(JSON.stringify(data[k]['category']['title']));
      k++;
    }
  } else {
    while (k < data.length) {
      questions.push(JSON.stringify(data[k]['question']));
      answers.push(JSON.stringify(data[k]['answer']));
      categories.push(JSON.stringify(data[k]['category']['title']));
      k++;
    }
  }

}

// generateRandomResults: Generates random results for the case that the user does not specify a keyword
async function generateRandomResults(link, rand) {
  var result = await fetch(link + String(rand));
  var data = await result.json();
  while (data.length == 0) {
    var randNum = generateRandomCategory();
    try {
      var result = await fetch(link + String(randNum));
      var data = await result.json();
    } catch (error) {
      randNum = generateRandomCategory();
      continue;
    }
  }

  var k = 0;
  while (k < data.length) {
    try {
      categories.push(JSON.stringify(data[k]['category']['title']));
    } catch (error) {
      k++;
      continue;
    }
    questions.push(JSON.stringify(data[k]['question']));
    answers.push(JSON.stringify(data[k]['answer']));
    k++;
  }

}

//titleCase: Make all first characters of a string sentence upper case
function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

//starQuestions: Deals with the user clicking the favorites button
function starQuestions(x) {
  if (x.style.color != "red") {
    x.style.color = "red";
    favQuestions.push(questions[counter]);
    favAnswers.push(answers[counter]);
    favCategories.push(categories[counter]);
    //console.log(favQuestions);

  } else {
    x.style.color = "white";
    favQuestions.splice(favQuestions.indexOf(questions[counter]), 1);
    favAnswers.splice(favAnswers.indexOf(answers[counter]), 1);
    favCategories.splice(favCategories.indexOf(categories[counter]), 1);
    setCookie("favQuestions", JSON.stringify(favQuestions), 30);
    setCookie("favAnswers", JSON.stringify(favAnswers), 30);
    setCookie("favCategories", JSON.stringify(favCategories), 30);

  }

  //console.log("Favorite Questions: " + favQuestions);
}

//setCookie: Sets the document cookie to the given input
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  //alert(document.cookie);
}

//getCookie: Grabs the cookie based off of its name
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}