var tree = {
    word: "",
    included: false,

};

function loadWords(words) {
    for (var i = 0; i < words.length; i++) {
        loadWord(words[i]);
    }
}

function loadWord(word) {
    word = word.toLowerCase();
    var node = tree;

    for (var i = 0; i < word.length; i++) {
        // character at i, but its a string of length one.
        var ch = word[i];

        // Check for child node along edge for the character we are at
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
            // Just move in child node
            node = node[ch];
        }
    }
    if (node != tree) {
        node.included = true;
    }
}

const letters = "abcdefghijklmnopqrstuvwxyz"
function allWords(node, words) {
    if (!node) { return; }
    if (!words) { words = []; }

    if (node.included) {
        words.push(node.word);
    }

    for (var i = 0; i < letters.length; i++) {
        allWords(node[letters[i]], words);
    }

    return words;
}

function nodeFor(word) {
    var node = tree;
    for (var i = 0; i < word.length; i++) {
        var ch = word[i];
        if (node[ch] === undefined) {
            return null;
        }
        node = node[ch];
    }
    return node;
}

/*
loadWords([
    "apple",
    "aardvark",
    "Awesome",
    "Awful",
    "ASS",
    "ASSHOLE",
    "ASSASSIN",
]);
console.log("Current tree:");
console.log(tree);

//*/

function buildPredictions() {
    console.log(`key typed: "${$("#text").val()}"`);
    var entry = $("#text").val().toLowerCase();

    // Match non- (a-z) characters
    var matches = entry.match(new RegExp("([^a-z])", "g"));
    var lastWord = "";
    if (matches != null) {
        // Get the last one (closest to the end)
        var lastMatch = matches[matches.length - 1];
        // Get the last index of such charater
        var lastIndex = entry.lastIndexOf(lastMatch);
        // Get from that last index to the end of the entry
        lastWord = entry.substring(lastIndex + 1);
    } else {
        lastWord = entry;
    }

    var wordNode = nodeFor(lastWord);
    if (lastWord.length >= 3 && wordNode !== null) {
        var predictions = allWords(wordNode);

        //$("#stuff").html(predictions.join("<br />"));
        $("#predictions").html("");
        predictions.forEach((word, index) => {
            var element = $("<li></li>").text(word);
            element.click(() => {
                $("#text").val(
                    entry.replace(new RegExp(lastWord + "$"), word + " ")
                );
                console.log(`${word} clicked!`);
                buildPredictions();
            });

            $("#predictions").append(element);
        });
    } else {
        $("#predictions").html("No Predictions");
    }
}

$(document).ready(function () {
    $("#text").on("change keyup paste", function () {
        buildPredictions();
    });

    $.ajax({
        //url: "./words.txt",
        url: "http://mcs.msudenver.edu/~gordon/cs4050/hw/words",
        
        success: function (result) {
            var words = result.split("\n");

            console.log(`got ${words.length} words!`);

            loadWords(words);

            $("#preload").hide();
            $("#content").show();

            buildPredictions();
        }
    });

});