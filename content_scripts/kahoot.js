// Options that determine how the notifications look.
toastr.options = {
    "debug": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "4000",
    "hideDuration": "1000",
    "timeOut": "4000",
    "extendedTimeOut": "4000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

// Log successful content script load
console.log("Loaded Kahoot AI")
// Notify the user that the script has loaded
toastr.success("Kahoot AI Loaded!")

let popupQueue = []

// Create a fullscreen blur div
let blurBox = document.createElement('div')
blurBox.style.position = 'fixed'
blurBox.style.width = '100%'
blurBox.style.height = '100%'
blurBox.style.top = '0'
blurBox.style.left = '0'
blurBox.style.zIndex = '9998'
blurBox.style.opacity = '0.5'
blurBox.style.backgroundColor = '#000'
blurBox.style.visibility = 'hidden'
// Create the update popup
let updateWindow = document.createElement('div')
updateWindow.style.position = 'fixed'
updateWindow.id = 'update-popup'
updateWindow.style.zIndex = '9999'
updateWindow.style.display = 'block'
// Size the popup
updateWindow.style.width = '400px'
updateWindow.style.height = '250px'
// Center the popup
updateWindow.style.top = '50%'
updateWindow.style.left = '50%'
updateWindow.style.transform = 'translate(-50%, -50%)'
// Style the popup
updateWindow.style.backgroundColor = '#f2f2f2'
updateWindow.style.border = '2px solid black'
updateWindow.style.padding = '16px'
updateWindow.style.borderRadius = '10px'
updateWindow.style.textAlign = 'center'
// Hide the popup
updateWindow.style.visibility = 'hidden'
// Add a close button
let closeButton = document.createElement('span')
// Position the close button
closeButton.style.position = 'absolute'
closeButton.style.right = '4px'
closeButton.style.top = '4px'
// Change the text of the close button to an X
closeButton.innerHTML = '&times;'
// Style the close button
closeButton.style.fontSize = '40px'
closeButton.style.fontWeight = 'bold'
// Make the hover cursor a pointer
closeButton.style.cursor = 'pointer'
// Give it some transitioning
closeButton.style.transition = '0.1s'
// Add a close button event listener
closeButton.addEventListener('click', function() {
    if (popupQueue.length > 0) {
        removePopupElements()
        popupQueue[0].forEach(function(popup) {
            updateWindow.appendChild(popup)
        })
        popupQueue.splice(0, 1)
    } else {
        blurBox.style.visibility = 'hidden'
        updateWindow.style.visibility = 'hidden'
        removePopupElements()
    }
})
// Add hover effects
closeButton.addEventListener('mouseover', function() {closeButton.style.color = '#808080'})
closeButton.addEventListener('mouseleave', function() {closeButton.style.color = 'black'})
// Add the popup and blur to the page
document.body.appendChild(blurBox)
document.body.appendChild(updateWindow)
// Add the close button to the popup
updateWindow.appendChild(closeButton)


// This function will get the amount of words in a string
function getWordCount(str) {
    return str.split(' ')
        .filter(function(n) { return n !== '' })
        .length;
}

// This function will compare two strings and return the percentage of similarity
function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')
    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;
    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;
        firstBigrams.set(bigram, count);
    };
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;
        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }
    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function removePopupElements() {
    if (updateWindow.children.length > 1) {
        while (updateWindow.children.length > 1) {
            updateWindow.removeChild(updateWindow.children[1])
        }
    }
}

function queueElements(elements) {
    if (updateWindow.children.length > 1) {
        let list = []
        elements.forEach(function(element) {
            list.push(element)
        })
        popupQueue.push(list)
    } else {
        elements.forEach(function(element) {
            updateWindow.appendChild(element)
        })
        blurBox.style.visibility = 'visible'
        updateWindow.style.visibility = 'visible'
    }
}

function apiKeyPopup() {
    console.trace('Creating api key popup')
    // Create the popup elements
    let titleText = document.createElement('h1')
    let bodyText = document.createElement('p')
    // Style the text
    titleText.style.fontSize = '24px'
    bodyText.style.fontFamily = 'Poppins'
    bodyText.style.fontSize = '16px'
    // Change the text content
    titleText.innerHTML = '<b>Invalid API Key</b>'
    bodyText.innerHTML = '<br>You need to have a SerpAPI key to use Kahoot AI. <br><br>' +
        '1. Go to the <a style="color: -webkit-link;" href="https://serpapi.com/users/sign_in" target="_blank">SerpApi website</a>.<br>' +
        '2. Create an account if you do not already have one<br>' +
        '3. Once logged in, choose API key from the sidebar<br>' +
        '4. Then paste the API key below<br>'
    let input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('id', 'apiKey')
    input.setAttribute('size', '10')
    let validText = document.createElement('p')
    validText.style.fontFamily = 'Poppins'
    validText.style.fontSize = '16px'
    validText.style.color = 'red'
    validText.style.marginTop = '10px'
    validText.innerHTML = 'Invalid API Key'
    let timeout
    input.addEventListener('input', function() {
        clearTimeout(timeout)
        timeout = setTimeout(function() {
            if (input.value.length === 64) {
                chrome.runtime.sendMessage({type: "serpapi_test", "api_key": input.value}, function (response) {
                    console.log(response)
                    if (response.valid) {
                        validText.style.color = 'green'
                        validText.innerHTML = 'Valid API Key!<br>You can close this popup.'
                        input.disabled = true
                        chrome.storage.local.set({key: input.value});
                    } else {
                        validText.style.color = 'red'
                        validText.innerHTML = 'Invalid API Key'
                    }
            })} else {
                validText.style.color = 'red'
                validText.innerHTML = 'Invalid API Key'
            }}, 500)
    })

    // Queue the elements
    queueElements([titleText, bodyText, input, validText])
}

function updatePopup() {
    console.trace('Creating update popup')
    // Create the popup elements
    let titleText = document.createElement('h1')
    let bodyText = document.createElement('p')
    // Style the text
    titleText.style.fontSize = '24px'
    bodyText.style.fontFamily = 'Poppins'
    bodyText.style.fontSize = '16px'
    // Change the text content
    titleText.innerHTML = '<b>Kahoot AI Update</b>'
    chrome.runtime.sendMessage({type: "check_version"}, function(response) {
        if (response.valid) {
            bodyText.innerHTML = '<br>Kahoot AI has updated to version <b>' + response.version + '</b>!<br>'
        } else {
            bodyText.innerHTML = '<br>Kahoot AI has updated to the latest version!<br>'
        }
    })
    // Queue the elements
    queueElements([titleText, bodyText])
}

// Make variable global
let data;

// This will wait until the question unloads and then run the observer that waits for the next question to load
const wait_for_question_unload = new MutationObserver((mutations, obs) => {
    // Selects the question container
    const questionTitle = document.querySelector("[data-functional-selector='block-title']");
    // Checks if the question container exists
    if (!questionTitle) {
        // Disconnects the observer
        obs.disconnect();
        // Waits 2 seconds before running the question load observer because it sometimes glitches out
        setTimeout(function(){wait_for_question_load.observe(document, {childList: true, subtree: true});}, 200);
    }
});

// This will wait for the question to load
const wait_for_question_load = new MutationObserver((mutations, obs) => {
    // Answers do not exist at this point
    // Selects the question container
    const questionTitle = document.querySelector("[data-functional-selector='question-block-title']");
    // Checks if the question container exists
    if (questionTitle) {
        // Notification options
        toastr.options = {
            "debug": false,
            "progressBar": true,
            "positionClass": "toast-top-center",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "8000",
            "hideDuration": "1000",
            "timeOut": "8000",
            "extendedTimeOut": "8000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
        // Get the api key from the browser storage
        chrome.storage.local.get('key', (key) => {
            // Send a message to the background script to google the question
            chrome.runtime.sendMessage({
                // Tells the background script to google the question
                type: "serpapi_search",
                // Gives the background script the user's api key
                api_key: key.key,
                // Gives the background script the question text that has the bad characters replaced
                question: questionTitle.firstElementChild.firstElementChild.innerHTML
                    .replaceAll("?", "")
                    .replaceAll("_", "")
                    .replaceAll("  ", " ")
                    .replaceAll(" ", "+")}, function(response) {
                // Checks if the response is valid
                if (response.valid) {
                    // Sets the global variable data to the response from the background script
                    data = response.json;
                    // Disconnects the observer and waits for the answers to load
                    obs.disconnect();
                    wait_for_answer_load.observe(document, {
                        childList: true,
                        subtree: true
                    })
                } else {
                    // Notifies the user that the api key is invalid
                    toastr.error("Couldn't connect to the servers. Check the console for more information.");
                    console.log(response.error);
                    // Disconnects the observer and waits for the answers to load
                    obs.disconnect();
                    wait_for_question_unload.observe(document, {
                        childList: true,
                        subtree: true
                    })
                }
            })
        })
    }
});

const wait_for_answer_load = new MutationObserver((mutations, obs) => {
    // Selects the first answer box
    let ans = document.querySelector("[data-functional-selector='answer-0']");
    // Checks if the answer box exists
    if (ans) {
        let pre_answers = []
        // Loops 4 times because there are max 4 answers
        for (let i = 0; i <= 3; i++) {
            // Selects the answer container
            let ans = document.querySelector("[data-functional-selector='answer-" + i + "']");
            // Checks if the answer container does not exist
            if (ans === null) {
                // Breaks the loop if the answer container does not exist
                break
            }
            // Pushes the answer container to the pre_answers array
            pre_answers.push(ans)
        }
        let answers = []
        // Loops through the pre_answers array
        for (let cur in pre_answers) {
            // Pushes the answer container and the answer text to the answers array
            answers.push([pre_answers[cur], pre_answers[cur].lastElementChild.firstElementChild.innerHTML])
        }
        // Checks if the question is a TF question
        if (answers.length === 2 && (answers[0][1] === "True" || answers[1][1] === "True")) {
            // Tells the user that the extension does not support TF questions
            toastr.error("Kahoot AI does not currently support True/False questions")
            // Disconnects the observer and waits for the question to unload
            obs.disconnect();
            wait_for_question_unload.observe(document, {
                childList: true,
                subtree: true
            });
            // Returns nothing so that the current observer ends
            return
        }
        // Temporary array to hold how confident the bot is that the answer is correct
        let temp = []
        // Loops through all the answers and checks for the possibility of the answer being correct
        for (let cur in answers) {
            // Checks if the Google question does not contain an answer box
            if (data["answer_box"] === undefined) {
                let total = 0
                // Checks to see if the current answer has more than one word
                if (getWordCount(answers[cur][1]) > 1) {
                    // Loops through all the google results (Max 10)
                    for (let cur_result in data["organic_results"]) {
                        // Checks if the current google result has a snippet
                        if (data["organic_results"][cur_result]["snippet"] !== undefined) {
                            // Adds the similarity percentage of the current answer and the snippet to the total
                            total += compareTwoStrings(data["organic_results"][cur_result]["snippet"], answers[cur][1])
                        }
                    }
                } else {
                    // This just makes sure that it is searching a word with spaces on both sides so that it
                    // doesn't count words where the answer is a part of it
                    let search_string = " " + answers[cur][1].replace(" ", "") + " "
                    // Loops through all the google results (Max 10)
                    for (let cur_result in data["organic_results"]) {
                        // Checks if the current google result has a snippet
                        if (data["organic_results"][cur_result]["snippet"] !== undefined) {
                            // For every time the answer word is in the snippet, it adds one to the total
                            total += data["organic_results"][cur_result]["snippet"].split(search_string).length - 1
                        }
                    }
                }
                // Pushes the current answer total to the temp array
                temp.push([answers[cur][0], answers[cur][1], total])
            }
            // Checks if the answer box is a normal answer box
            else if (data["answer_box"]["type"] === "organic_result") {
                // Checks if there is a big word answer in the answer box
                if (data["answer_box"]["answer"] !== undefined) {
                    // Pushes the similarity percentage of the current and the big word answer to the temp array
                    temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["answer"], answers[cur][1])])
                }
                // Checks if there is a snippet in the answer box
                else if (data["answer_box"]["snippet"] !== undefined) {
                    // Pushes the similarity percentage of the current and the snippet to the temp array
                    temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["snippet"], answers[cur][1])])
                }
                // Checks if there is a title in the answer box
                else if (data["answer_box"]["title"] !== undefined) {
                    // Pushes the similarity percentage of the current and the title to the temp array
                    temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["title"], answers[cur][1])])
                }
            }
            // Checks if the answer box is a calculator type
            else if (data["answer_box"]["type"] === "calculator_result") {
                // Pushes the similarity percentage of the current and the calculator answer to the temp array
                temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["result"], answers[cur][1])])
            }
            // Checks if the answer box is a finance type
            else if (data["answer_box"]["type"] === "finance_results") {
                // Pushes the similarity percentage of the current and the price to the temp array
                temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["price"], answers[cur][1])])
            }
            // Checks if the answer box is a population type
            else if (data["answer_box"]["type"] === "population_result") {
                // Pushes the similarity percentage of the current and the population to the temp array
                temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["population"], answers[cur][1])])
            }
            // Checks if the answer box is a converter type
            else if (data["answer_box"]["type"] === "currency_converter") {
                // Pushes the similarity percentage of the current and the converter answer to the temp array
                temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["price"], answers[cur][1])])
            }
            // Checks if the answer box is a dictionary type
            else if (data["answer_box"]["type"] === "dictionary_results") {
                let total = 0;
                // Loops through all the definitions in the answer box
                for (let def in data["answer_box"]["definitions"]) {
                    // Pushes the similarity percentage of the current and the definition to the temp array
                    total += [answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["definitions"][def], answers[cur][1])]
                }
                temp.push([answers[cur][0], answers[cur][1], total])
            }
            // Checks if the answer box is a translation type
            else if (data["answer_box"]["type"] === "translation_result") {
                // Pushes the similarity percentage of the current and the translation to the temp array
                temp.push([answers[cur][0], answers[cur][1], compareTwoStrings(data["answer_box"]["translation"]["target"]["text"], answers[cur][1])])
            }
            // If the answer box is any other type then it is not supported yet and lets the user know
            else {
                console.log("Answer box type not supported yet")
                toastr.warning("This type of question is not supported yet.")
            }
        }
        let max = 0
        let correct_answer = null
        // Loops through all the lists in the temp array
        for (let cur in temp) {
            // If the confidence of the current answer is greater than the max confidence then it is the new max confidence
            if (temp[cur][2] > max) {
                max = temp[cur][2]
                correct_answer = temp[cur][0]
            }
        }
        // If all the confidence values are 0 then it lets the user know that it could not find a correct answer
        if (max === 0) {
            toastr.error("Couldn\'t figure out the correct answer")
        }
        // Checks if it could find a could find the correct answer
        else {
            // Loops through all the answers
            for (let cur in answers) {
                // Checks if the current answer is the correct answer
                if (answers[cur][0] === correct_answer) {
                    // Changes the background color of the current answer to green
                    answers[cur][0].style.backgroundColor = "rgb(94, 176, 53)"
                    answers[cur][0].firstElementChild.style.backgroundColor = "rgb(94, 176, 53)"
                }
                // Checks if the current answer is not the correct answer
                else {
                    // Changes the background color of the current answer to red
                    answers[cur][0].style.backgroundColor = "rgb(235, 47, 78)"
                    answers[cur][0].firstElementChild.style.backgroundColor = "rgb(235, 47, 78)"
                }
            }
        }
    }
    // Disconnects the observer and waits for the question to unload
    obs.disconnect();
    wait_for_question_unload.observe(document, {
        childList: true,
        subtree: true
    });
})

// Checks if the update popup should be shown
chrome.runtime.sendMessage({type: "check_update"}, function (response) {
    if (response.valid) {
        // Shows the update popup
        updatePopup()
    }
})

// Checks if the api key is valid
chrome.storage.local.get('key', (key) => {
    chrome.runtime.sendMessage({type: "serpapi_test", "api_key": key.key}, function (response) {
        if (!response.valid) {
            // Shows the api key popup
            apiKeyPopup()
        }
    })
})


// Starts the observer that waits for the first question to load
wait_for_question_load.observe(document, {
    childList: true,
    subtree: true
});