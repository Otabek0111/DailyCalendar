let diet = document.getElementById("diet");
let numOfRecipes = 30;
let firstName = document.getElementById("first-name");
let lasttName = document.getElementById("last-name");
let submitBtn = document.getElementById("submitBtn");
let submitSec = document.querySelector("#submitSection");
let checkBox = document.getElementById("weather");
var cityInput = document.getElementById("city");







document.addEventListener("DOMContentLoaded", function () {
    let selectedDiet;
    let recipeContainer;
    let cityName; // Declare cityName variable here

    function createRecipeContainer() {
        recipeContainer = document.createElement("div");
        recipeContainer.id = "recipe-container";
        document.body.appendChild(recipeContainer);
    }

    diet.addEventListener("change", function () {
        selectedDiet = this.value;
    });

    submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        submitSec.setAttribute("class", "hide");
        cityName = cityInput.value || "Atlanta"; // Set cityName here

        // Fetch current weather separately for today
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=c27c727042da1e145bf14c1d47031e5d`)
            .then(response => response.json())
            .then(currentData => {
                // console.log(currentData);
                let currentWeatherCard = document.createElement("div");
                currentWeatherCard.setAttribute("class", "card");
                let currentDate = document.createElement("h5");
                currentDate.textContent = "Today";
                let currentTemp = document.createElement("p");
                currentTemp.textContent = `Temperature: ${currentData.main.temp} °F`;
                let currentHumidity = document.createElement("p");
                currentHumidity.textContent = `Humidity: ${currentData.main.humidity}%`;
                let currentWind = document.createElement("p");
                currentWind.textContent = `Wind Speed: ${currentData.wind.speed} mph`;
                let currentIcon = document.createElement("img");
                currentIcon.setAttribute("src", `http://openweathermap.org/img/w/${currentData.weather[0].icon}.png`);
                currentWeatherCard.append(currentDate, currentTemp, currentHumidity, currentWind, currentIcon);
                document.getElementById("weather").appendChild(currentWeatherCard);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });

        // Fetch forecast weather for the next 5 days
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=c27c727042da1e145bf14c1d47031e5d`)
            .then(response => response.json())
            .then(data => {
                let weatherData = data.list;
                let weatherEl = document.getElementById("weather");
                weatherEl.innerHTML = "";
                for (let i = 0; i < weatherData.length; i += 9) {
                    // Inside the loop where you create weather cards
                    let weatherCard = document.createElement("div");
                    weatherCard.setAttribute("class", "card");
                    let cityNameElement = document.createElement("h4");
                    cityNameElement.textContent = cityName; // Display city name
                    let date = document.createElement("h5");
                    date.textContent = new Date(weatherData[i].dt_txt).toDateString();
                    let temp = document.createElement("p");
                    temp.textContent = `Temperature: ${weatherData[i].main.temp} °F`;
                    let humidity = document.createElement("p");
                    humidity.textContent = `Humidity: ${weatherData[i].main.humidity}%`;
                    let wind = document.createElement("p");
                    wind.textContent = `Wind Speed: ${weatherData[i].wind.speed} mph`;
                    let icon = document.createElement("img");
                    icon.setAttribute("src", `http://openweathermap.org/img/w/${weatherData[i].weather[0].icon}.png`);
                    weatherCard.append(cityNameElement, date, temp, humidity, wind, icon);
                    weatherEl.appendChild(weatherCard);
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });

        // Fetch recipes
        fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=0821799963dc4a95ab208456cf22646c&diet=${selectedDiet}&number=${numOfRecipes}`)
            .then((response) => response.json())
            .then((data) => {
                if (!recipeContainer) {
                    createRecipeContainer();
                } else {
                    recipeContainer.innerHTML = "";
                }

                const events = [];
                const currentDate = new Date();
                const currentDayOfMonth = currentDate.getDate();

                data.results.forEach((recipe, index) => {
                    if (index < 20) {
                        const dateToFetch = new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            currentDayOfMonth + index
                        ).toDateString().split(" ").slice(1).join(" ");

                        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=c27c727042da1e145bf14c1d47031e5d`)
                            .then(response => response.json())
                            .then(weatherData => {
                                let weatherEl = document.createElement("div");
                                weatherEl.setAttribute("class", "weather-info");

                                const weatherAt12PM = weatherData.list.find(entry => {
                                    const entryDate = new Date(entry.dt_txt);
                                    return entryDate.getHours() === 12 && entryDate.toDateString().includes(dateToFetch);
                                });

                                if (weatherAt12PM) {
                                    let weatherCard = document.createElement("div");
                                    weatherCard.setAttribute("class", "weather-card");
                                    let date = document.createElement("h5");
                                    date.textContent = new Date(weatherAt12PM.dt_txt).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    });
                                    let temp = document.createElement("p");
                                    temp.textContent = `Temperature: ${weatherAt12PM.main.temp} °F`;
                                    let humidity = document.createElement("p");
                                    humidity.textContent = `Humidity: ${weatherAt12PM.main.humidity}%`;
                                    let wind = document.createElement("p");
                                    wind.textContent = `Wind Speed: ${weatherAt12PM.wind.speed} mph`;
                                    let icon = document.createElement("img");
                                    icon.setAttribute("src", `http://openweathermap.org/img/w/${weatherAt12PM.weather[0].icon}.png`);
                                    weatherCard.append(date, temp, humidity, wind, icon);
                                    weatherEl.appendChild(weatherCard);

                                    let showWeatherButton = document.createElement("button");

                                    showWeatherButton.addEventListener("click", function () {
                                        showWeatherDetails(cityName, weatherAt12PM);
                                    });
                                    weatherEl.appendChild(showWeatherButton);
                                }

                                events.push({
                                    title: recipe.title,
                                    start: new Date(
                                        new Date().getFullYear(),
                                        new Date().getMonth(),
                                        currentDayOfMonth + index
                                    ).toISOString().split("T")[0],
                                    extendedProps: {
                                        weatherInfo: weatherEl.innerHTML
                                    }
                                });

                                if (index === 19) {
                                    var calendarEl = document.getElementById("calendar");

                                    var calendar = new FullCalendar.Calendar(calendarEl, {
                                        initialView: "dayGridMonth",
                                        headerToolbar: {
                                            start: "",
                                            center: "title",
                                            end: "",
                                        },
                                        eventDidMount: function (info) {
                                            if (info.event.extendedProps.weatherInfo) {
                                                var popover = new bootstrap.Popover(info.el, {
                                                    container: "body",
                                                    html: true,
                                                    content: info.event.extendedProps.weatherInfo,
                                                    trigger: "hover",
                                                });
                                            }
                                        },

                                        events: events,
                                        eventDidMount: function (info) {
                                            if (info.event.extendedProps.weatherInfo) {
                                                var weatherButton = document.createElement('button');
                                                weatherButton.classList.add('weather-button');
                                                weatherButton.textContent = 'Show Weather';
                                                weatherButton.style.color = 'black'; // Change text color
                                                weatherButton.style.padding = '10px 20px'; // Add padding
                                                weatherButton.style.border = 'none'; // Remove border
                                                weatherButton.style.borderRadius = '5px'; // Add border radius
                                                weatherButton.addEventListener('click', function () {
                                                    var weatherSection = info.el.querySelector('.weather-section');
                                                    if (!weatherSection) {
                                                        weatherSection = document.createElement('div');
                                                        weatherSection.classList.add('weather-section');
                                                        weatherSection.classList.add('weather-details');
                                                        weatherSection.innerHTML = info.event.extendedProps.weatherInfo;
                                                        info.el.appendChild(weatherSection);
                                                        weatherButton.textContent = 'Close'; // Change button text to "Close"
                                                    } else {
                                                        weatherSection.remove();
                                                        weatherButton.textContent = 'Show Weather'; // Change button text to "Show Weather"
                                                    }
                                                });

                                                var buttonContainer = document.createElement('div');
                                                buttonContainer.classList.add('button-container');
                                                buttonContainer.appendChild(weatherButton);

                                                info.el.appendChild(buttonContainer);
                                            }
                                        }
                                    });

                                    calendar.render();
                                }
                            })
                            .catch(error => {
                                console.error('There has been a problem with your fetch operation:', error);
                            });
                    }
                });

                // Display recipes with images
                data.results.forEach(recipe => {
                    let recipeCard = document.createElement("div");
                    recipeCard.setAttribute("class", "recipe-card");
                    let title = document.createElement("h2");
                    title.textContent = recipe.title;
                    let image = document.createElement("img");
                    image.src = recipe.image; // Set the image source
                    let instructions = document.createElement("p");
                    instructions.textContent = recipe.instructions;
                    recipeCard.append(title, image, instructions);
                    recipeContainer.appendChild(recipeCard);
                });
            });
    });
});

function showWeatherDetails(cityName, weatherData) {
    // alert(`Weather details for ${cityName} on ${new Date(weatherData.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: \nTemperature: ${weatherData.main.temp} °F \nHumidity: ${weatherData.main.humidity}% \nWind Speed: ${weatherData.wind.speed} mph`);
}

    
        
    
                            

























// var workout = document.getElementById("workout")
// var workoutTime = document.getElementById("time")
// var workoutMuscle = document.getElementById("muscle")
// var workoutLocation = document.getElementById("location")
// var workoutEquipment = document.getElementById("equipment")



// fetch(`https://workout-planner1.p.rapidapi.com/?time=${workoutTime}&muscle=${workoutMuscle}&location=${workoutLocation}&equipment=${workoutEquipment}`, {
//   method: 'GET',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-RapidAPI-Key': 'b256a37573msh02df707d15e1ef6p128ab3jsn991aea61d01d',
//     'X-RapidAPI-Host': 'workout-planner1.p.rapidapi.com'
//   }
// })
//   .then(response => response.json())
//   .then(data => {
//     // Handle the response data
//     // console.log(data.Exercises[0].Exercise)
//     for (var i = 0; i < data.Exercises.length; i++){
//       //create workout div element
//      var workOutEl = document.createElement("p");
//      //Seting the text of the div element
//      console.log(data.Exercises[i].Exercise);
//      //Appending the dynamically generated html to the div associated with the workout
//      workout.append(workOutEl);
//      workOutEl.textContent = data.Exercises[i].Exercise;
//     }
//     ;
//   })
//   .catch(error => {
//     // Handle any errors
//     console.error('Error:', error);
//   });
