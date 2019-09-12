// Root of our tree
var tree = {
    word: "",
    included: false,
};

// helper that loads all words in an array
function loadWords(words) {
    for (var i = 0; i < words.length; i++) {
        loadWord(words[i]);
    }
}

// Loads a single word by creating all nodes that are needed for it
// and marking the final node as included.
function loadWord(word) {
    // Lowercase word to always use a-z chars
    word = word.toLowerCase();
    // Start from root of tree
    var node = tree;

    // For each char in word...
    for (var i = 0; i < word.length; i++) {
        // character at i, but it is a string of length 1
        var ch = word[i];

        // Check for child node along edge for character
        if (node[ch] === undefined) {
            // Create child node with next word
            var child = {
                word: node.word + ch
            }

            // Add child to tree
            node[ch] = child;
            // Move into child node
            node = child;
        } else {
            // Just move into child node
            node = node[ch];
        }

    }

    // If we're not at the root, mark the node as included in the dictionary
    if (node !== tree) {
        node.included = true;
    }
}

// helper constant 
const letters = "abcdefghijklmnopqrstuvwxyz";
// Function gets all included dictionary words underneath a given node
function allWords(node, words) {
    // create a new array if words is null
    if (!words) { words = []; }
    // base case: node is null, return what we got 
    if (!node) { return words; }

    // If the node we are at is included, toss it into the words array
    if (node.included) {
        words.push(node.word);
    }

    // try recursing in all 26 directions
    for (var i = 0; i < letters.length; i++) {
        allWords(node[letters[i]], words);
    }
    // Return list of words 
    return words;
}

// Traces through the tree to find a node for a given word
function nodeFor(word) {
    // Start at the root
    var node = tree;

    // foreach char in word...
    for (var i = 0; i < word.length; i++) {
        var ch = word[i];
        // Try moving down that direction...
        if (node[ch] === undefined) {
            // if it doesn't exist, return null
            return null;
        }
        node = node[ch];
    }
    // Return the node we ended at
    return node;
}

// Build predictions onto the page
function buildPredictions() {
    // console.log(`key typed: "${ $("#text").val() }"`);
    // Get the text the user typed...
    var entry = $("#text").val().toLowerCase();

    // Get the last word the user is typing...
    // Match non- (a-z) characters
    var matches = entry.match(new RegExp("([^a-z])", "g"))
    var lastWord = "";
    if (matches != null) {
        // Get the last one (closest to end)
        var lastMatch = matches[matches.length - 1];
        // Get the last index of such charater
        var lastIndex = entry.lastIndexOf(lastMatch);
        // Get from that last index to the end of the entry
        lastWord = entry.substring(lastIndex + 1);
    } else {
        lastWord = entry;
    }

    // Get the node for what the user has typed
    var wordNode = nodeFor(lastWord);
    // If we are not long enough or don't have a node
    // Don't check for predictions
    if (lastWord.length >= 3 && wordNode !== null) {
        // Get all of the words at the node we are at 
        var predictions = allWords(wordNode);

        // Clear existing predictions
        $("#predictions").html("");

        // Create a list element for every predictions
        predictions.forEach((word, index) => {

            // Create a list item
            var element = $("<li></li>").text(word);

            // Add a handler for clicking
            element.click(() => {
                // Replace the last instance of the word
                // with the prediction that was clicked plus a space
                $("#text").val(
                    entry.replace(new RegExp(lastWord + "$"), word + " ")
                );
                // Refresh predictions (clear it)
                buildPredictions();
            });

            // Append element to predictions
            $("#predictions").append(element);
        });

    } else {
        // No predictions or too short?
        $("#predictions").html("No Predictions");
    }

}

// Converts a Uint8Array to a String
function bufferToString(buffer) {
    var byteArr = new Uint8Array(buffer);
    try {
        var decompressed = pako.inflate(byteArr);
        return new TextDecoder("utf-8").decode(decompressed);

    } catch (err) {
        console.log(err);
        console.log(`Error converting to string`);
    }
    return "";
}

$(document).ready(function () {
    $("#text").on("change keyup paste", function () {
        buildPredictions();
    });

    // Have to make an old style XMLHttpRequest to get a byte[]
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "./words.dat", true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {

        // Swap out preloader for content
        $("#preload").hide();
        $("#content").show();

        // Get buffer and convert to string 
        var buffer = oReq.response;
        var result = bufferToString(buffer);

        // If we got empty string, that means something went wrong.
        if (result === "") {
            $("#predictions").html("Error loading predictions");
            $("#text").hide();
        } else {
            // Otherwise we restored the list of words
            var words = result.split("\n");
            console.log(`got ${words.length} words!`);
            // Fill the tree with the words we loaded 
            loadWords(words);
            // Build predictions (if there was text in the text entry previously)
            buildPredictions();
        }
    }
    // Actually fire request to get it to send
    oReq.send();

});