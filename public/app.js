async function login() {
  let credentials = {username: 'Danyel', password: '1234'};

  let response = await fetch('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  let data = await response.json();

  console.log(data);
}

async function fetchFlowers() {
  let response = await fetch('/flowers');
  return await response.json();
}

function createFlowerElement(flowerData) {
  // Create elements
  let flowerWrap = document.createElement('div');
  let flowerImage = document.createElement('img');
  let flowerTitle = document.createElement('div');

  // Add attributes
  flowerWrap.setAttribute('class', 'flower-wrap');
  flowerImage.setAttribute('src', flowerData.image);
  flowerImage.setAttribute('class', 'flower-image');
  flowerTitle.setAttribute('class', 'flower-title');
  flowerTitle.innerHTML = flowerData.name;

  // Nest the elements
  flowerWrap.appendChild(flowerImage);
  flowerWrap.appendChild(flowerTitle);

  return flowerWrap;
}

function renderFlowers(selector, flowersArray) {
  const flowersContainer = document.querySelector(selector);
  flowersContainer.innerHTML = null;

  flowersArray.forEach(flower => {
    let flowerElement = createFlowerElement(flower);
    flowersContainer.appendChild(flowerElement);
  });
}

// fetch and then render the flowers.
fetchFlowers().then(flowers => {
  renderFlowers('#flowers-container' ,flowers);
});