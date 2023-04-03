// Set up an array of possible box values (in this example, "B" represents a bomb and "R" represents a reward)
var boxes = ["B", "R", "R", "R", "R"];

// Shuffle the array to randomize the box values
function shuffle() {
  boxes.sort(() => Math.random() - 0.5);
  console.log(boxes)
}
shuffle()
// Set up an event listener for each box
var boxElements = document.querySelectorAll(".box");
for (var i = 0; i < boxElements.length; i++) {
  boxElements[i].addEventListener("click", function() {
    // Get the index of the clicked box
    var boxIndex = Array.from(boxElements).indexOf(this);

    // Get the value of the clicked box (either "B" or "R")
    var boxValue = boxes[boxIndex];

    // Check the box value and show an alert message accordingly
    let y = ''
    if (boxValue === "B") {
      y = confirm("Oh no! You found a bomb.");
    } else {
      y = confirm("Congratulations! You found a reward.");
    }

    if(y) {
      shuffle()
    }
  });
}
