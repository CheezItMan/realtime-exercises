const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

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

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  console.log('getting new msgs')
  let reader;
  const utf8Decoder = new TextDecoder('utf-8');
  try {
    const res = await fetch('/msgs');
    reader = res.body.getReader();
    console.log('successful fetch');
  } catch (e) {
    console.log('Connection Error', e);
    presence.innerText = '🔴';
  }

  presence.innerText = '🟢';

  let done = false;
  let chunk = null;
  do {
    let readerResponse;
    try {
      readerResponse = await reader.read();
      // Read 1st response
      chunk = utf8Decoder.decode(readerResponse.value, { stream: true, });
      done = readerResponse.done;
      console.log(chunk);
    } catch (error) {
      console.error('Reader Failed!', error);
      presence.innerText = '🔴';
      return;
    }

    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch (e) {
        console.error('parse Error', e);
      }
    }
  } while ( !done);
  presence.innerText = '🔴';
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
