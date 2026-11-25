// Headlines list
const headlines = [
    "I build robots so they work, and I play! 🤖🧠🦾",
    "My robots understand you better than your cat does! 🐱🤖",
    "I teach AI to talk, but it still won't text me back... 💬🤖",
    "Making robots smart enough to take over my chores! 🏠🤖",
    "Coding robots by day, debugging dreams by night! 🌙💻",
    "I whisper to robots... sometimes they whisper back. 🤖🔊",
    "Teaching AI to learn -- because robots deserve an education too! 🎓🤖",
    "Bringing robots to life -- without the horror movie twist! 🎬🤖",
    "Training AI, one bug at a time! 🐛🤖",
    "Robots do what I say... most of the time! 🎮🤖",
    "Robots do the boring work, I do the fun stuff! 🤖😎",
    "Robots clean up, I level up! 🤖🎮",
    "I make robots work smarter, so I can play harder! 🤖🔥",
    "Building robots that think for themselves -- sometimes too much! 🤖🧠",
    "I teach robots the art of conversation, but they still don't get my sarcasm... 🤖🤔",
    "Code, robots, repeat. That's my kind of cycle! 🔄🤖",
    "I'm the robot whisperer... but they don't always listen! 🤖💬",
    "From code to circuits -- bringing ideas to life with robots! 💡🤖",
    "Training AIs to talk, so I don't have to! 🗣️🤖",
    "My AI knows more than I do... and that's a little scary. 🤖👀",
    "When in doubt, let the robots figure it out! 🤖🔍",
    "Let's be real, robots never judge my messy code... 🤖💻",
    "Teaching AI to think for itself... and make its own decisions! 🤖🧠",
    "My AI doesn't need me to tell it what to do... it figures it out! 🤖💭",
    "Teaching AI to be independent... and maybe a little too ambitious! 🏆🤖"
];

// Function to select and display a random headline
function displayRandomHeadline() {
    const randomIndex = Math.floor(Math.random() * headlines.length);
    const selectedHeadline = headlines[randomIndex];
    const bioText = document.getElementById("bio-text");
    bioText.textContent = selectedHeadline;
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', displayRandomHeadline);