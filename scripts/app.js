// Aeternity requirements

const contractSource = `
payable contract Weather = 
    payable stateful entrypoint getWeather() = 

        let owner  = ak_bTK7KG7mLB49ngHzug4EFsJ6QvAU4E4VLzitTz4mnfbtAyP1o
        Chain.spend(owner,1000000)


    record user = {
        id : int,
        callerAddress : address,
        numberOfSearches : int}

    record state = {
        users : map(int,user),
        total : int}



    entrypoint init() ={users = {}, total =0}

    entrypoint getTotalTx() =
        state.total

    entrypoint getUser(index) =
        state.users[index] 


    

    stateful entrypoint addUser() =
    

        // let available = switch(Map.lookup(Call.caller, state.users))

        // if(Map.member(Call.caller, state.users[total]))
        //      put(state{users[id].numberOfSearches = 1})

        // else

        let newUser = {
            callerAddress = Call.caller,
            id = getTotalTx()+1, 
            numberOfSearches = 1}


        let index = getTotalTx() + 1
        put(state{users[index] = newUser, total = index})

`;

const contractAddress = "ct_zzNNFWpX2Vs9jN9LnLwawuJyyREjaLiPARABswxYEz8frbpX4";
var client = null;




async function callStatic(func, args) {

  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });

  const calledGet = await contract.call(func, args, {
    callStatic: true
  }).catch(e => console.error(e));

  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {
    amount: value
  }).catch(e => console.error(e));

  return calledSet;
}














// Targets
const cityForm = document.querySelector('form');
const card = document.querySelector('.card');
const details = document.querySelector('.details');
const time = document.querySelector('img.time');
const icon = document.querySelector('.icon img');

const updateUI = (data) => {
  // destructure properties
  const { cityDets, weather } = data;

  // update details template
  details.innerHTML = `
    <h5 class="my-3">${cityDets.EnglishName}</h5>
    <div class="my-3">${weather.WeatherText}</div>
    <div class="display-4 my-4">
      <span>${weather.Temperature.Metric.Value}</span>
      <span>&deg;C</span>
    </div>
  `;

  // update the night/day & icon images
  const iconSrc = `img/icons/${weather.WeatherIcon}.svg`;
  icon.setAttribute('src', iconSrc);
  
  const timeSrc = weather.IsDayTime ? 'img/day.svg' : 'img/night.svg';
  time.setAttribute('src', timeSrc);

  // remove the d-none class if present
  if(card.classList.contains('d-none')){
    card.classList.remove('d-none');
  }
};

const updateCity = async (city) => {

  const cityDets = await getCity(city);
  const weather = await getWeather(cityDets.Key);
  return { cityDets, weather };

};

cityForm.addEventListener('submit',async e => {
  client = await Ae.Aepp()
  // prevent default action
  e.preventDefault();

  await contractCall('getWeather', [], 1000000)

  
  
  // get city value
  const city = cityForm.city.value.trim();
  cityForm.reset();

  // update the ui with new city
  updateCity(city)
    .then(data => updateUI(data))
    .catch(err => console.log(err));

  // set local storage
  localStorage.setItem('city', city);

});

if(localStorage.getItem('city')){
  updateCity(localStorage.getItem('city'))
    .then(data => updateUI(data))
    .catch(err => console.log(err));
}