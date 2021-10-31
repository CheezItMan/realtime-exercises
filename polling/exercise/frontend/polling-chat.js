const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// Note can use requestAnimationFrame

// let's store all current messages here
let allChat = [];
let failedTries = 0;
const BACKOFF = 5000;

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    }
  };
  try {
    // allChat.unshift({
    //   ...data
    // });
    // render();
    const res = await fetch('/poll', options);
    const json = await res.json();
    console.log('Posted', json);
  } catch (error) {
    console.log('Error making a post', error);
  }


}

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch('/poll');
    json = await res.json();

    // If there's an error
    if (res.status >= 400) {
      throw new Error("Request didn't succeed: " + res.status);
    }
    allChat = json.msg;
    render();
    failedTries = 0;
  } catch(error) {
    // Backoff code
    console.error('Polling Error', error);

    failedTries++;
  }
  //   removed for setAnimationFrame
  // setTimeout(getNewMsgs, INTERVAL);
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// make the first request
// getNewMsgs();

// Much better because setTimeOut halts everything
// including animation and drawing in the screen

let timeToMakeNextRequest = 0;


// Should be a bare-bones function because it gets called:
//   A LOT!
async function pollChat(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    // Linear Backoff strategy
    timeToMakeNextRequest = time + INTERVAL + BACKOFF * failedTries;
  }

  requestAnimationFrame(pollChat);
}

requestAnimationFrame(pollChat);


/*
Things to talk about:

1.  SetInterval (why not do this?)
2.  Try-catch & async await
3.  What is the backoff strategy
4.  What does requestAnimationFrame do?
5.  DDOS  how is that a problem?  

*/