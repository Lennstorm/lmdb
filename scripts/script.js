'use strict';

window.addEventListener('load', async() => {
    console.log('c.log rad4 load');
    //Förslagsvis anropar ni era funktioner som skall sätta lyssnare, rendera objekt osv. härifrån
    movieData = await fetchMovies();
    processMovies();
    searchMovies();
//    fetchDataAndStore();
    setupCarousel();
    upDateTrailers();
    renderMovieGallery()
});

//Denna funktion skapar funktionalitet för karusellen
function setupCarousel() {
    console.log('c.log rad16 carousel');
    const buttons = document.querySelectorAll('[data-carousel-btn]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const offset = btn.dataset.carouselBtn === 'next' ? 1 : -1;
            const slides = btn.closest('[data-carousel').querySelector('[data-slides');
            const activeSlide = slides.querySelector('[data-active]');
            let newIndex = [...slides.children].indexOf(activeSlide) + offset;
            
            if(newIndex < 0) {
                newIndex = slides.children.length - 1;
            } else if( newIndex >= slides.children.length) {
                newIndex = 0;
            }

            slides.children[newIndex].dataset.active = true;
            delete activeSlide.dataset.active;
        });
    });
}

// Function för att hämta data från Jespers API

async function fetchMovies() {
 try {
    const response = await fetch('https://santosnr6.github.io/Data/movies.json');
    const movies = await response.json();
    console.log('c.log rad43 success fetching movies!');
    return movies;
 } catch(error) {
     console.log('c.log rad46  error fetching data', error);
     return [];
    }
}

async function processMovies() {
    try {
        movieData = await fetchMovies();
        
    } catch (error) {
        console.log('c.log rad56 Error processing data', error);
    }
}


// Global variabel som lagrar data
let movieData;

// async function fetchDataAndStore() {
//     try {
//         movieData = await fetchMovies();
//         console.log('c.log Fetched movie däta', movieData);        
//     } catch (error){
//         console.log('c.log rad69 ärror fetching däta', error)
//     }
// }

// Slumpgenerator som tar fram fem random filmer och lägger dem i karusellen

async function upDateTrailers() {
    try {
        const randomMovies = [];
        const usedIndexes = new Set();
        
        while (randomMovies.length < 5) {
            const randomIndex = Math.floor(Math.random() * movieData.length);
            if (!usedIndexes.has(randomIndex)) {
                randomMovies.push(movieData[randomIndex]);
                usedIndexes.add(randomIndex);
            }
        }        
        
        console.log('* * * * * Slumpade filmer:');
        randomMovies.forEach(movie => {
            console.log('* *', movie.title);
        });

        const iframes = document.querySelectorAll('.carousel__slide iframe');
        iframes.forEach((iframe, index) => {
            iframe.src = randomMovies[index].trailer_link;
        })

        console.log('c.log rad98 random filmer har lagts till i DOM');
    }   catch (error) {
        console.log('c.log rad100 din jävla klant du har kodat fel!', error);
    }
}

// Function för att rendera ut topp-filmerna i DOM
async function renderMovieGallery() {
    try {
        const popularCardContainer = document.querySelector("#popularCardContainer");
        movieData.forEach(movie => {
            const movieCard = document.createElement("article")
            movieCard.classList.add("poplular__card");

            const posterImg = document.createElement("img");
            posterImg.src = movie.poster;
            posterImg.alt = movie.title;
            movieCard.appendChild(posterImg);

            const title = document.createElement("h3")
            title.textContent = movie.title;
            movieCard.appendChild(title);

            // Skapa summering av filmen, men det funkar ju inte för det finns inte nån summary i API
            // const summary = document.createElement("p");
            // summary.textContent = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, aspernatur!';
            // movieCard.appendChild(summary);

            popularCardContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.log('c.log rad129 Nu blev det fel i filmhämtningen, Göran!', error);
    }
}

//   Sökfunktion för filmer att skicka till API

async function searchMovies() {
    const searchFormRef = document.querySelector("form");
    const searchInputRef = document.querySelector("#searchInput");

    searchFormRef.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('searchmovies');    
        const searchTerm = searchInputRef.value.trim();
        if (searchTerm === '') {
            location.reload();
        } else {
            try {
                const searchResults = await fetchSearchResults(searchTerm);
                renderSearchResults(searchResults);
                // DÖLJA movieDetails
                const movieDetSect = document.querySelector('#movieDetails');
                movieDetSect.classList.add('d-none');
            } catch (error) {
            console.log('Error i hämtingen, du!', error);
            }
        }
    });
};

// if (searchTerm !== '') {
//     try {
//         const searchResults = await fetchSearchResults(searchTerm);
//         renderSearchResults(searchResults);
//     } catch (error) {
//     console.log('Error i hämtingen, du!', error);
//     }
// }
// });
// };

// bred sökning i API - startas av klick i funktionen searchMovies()
async function fetchSearchResults(searchTerm) {
    const apiKey = '792523f7';
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.Response === 'True') {
        return data.Search;
    } else {
        throw new Error(data.Error);
    }
}

// rendera sökresultat som lista - startas av eventlyssnare i funktionen searchMovies()
function renderSearchResults(results) {
    const trailerSectionRef = document.querySelector('#trailer-section');
    trailerSectionRef.classList.add('d-none');
    const popMoviesSection = document.querySelector('#popMovies');
    popMoviesSection.classList.add('d-none');
    showSearchResultsSection();
    const resultsListRef = document.querySelector("#resultsList");
    while(resultsListRef.firstChild){
        resultsListRef.removeChild(resultsListRef.firstChild);
    }
    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.classList.add('result');
        listItem.dataset.id = result.imdbID;
        listItem.addEventListener('click', fetchMovieDetails)
        const image = document.createElement('img');
        image.src = result.Poster;
        listItem.appendChild(image);

        const title = document.createElement('span');
        title.textContent = result.Title;
        listItem.appendChild(title);

        resultsListRef.appendChild(listItem);
    });
    const movieDetailsRef = document.querySelector('#movieDetails');
    const searchResultsRef = document.querySelector('#searchResults');
    movieDetailsRef.addEventListener('click', (event) => {
        movieDetailsRef.classList.add('d-none');
        while (movieDetailsRef.firstChild) {
            movieDetailsRef.removeChild(movieDetailsRef.firstChild);}
        searchResultsRef.classList.remove('d-none');


    });


}

//  funktion för att göra specifik sökning på IMDb-ID

async function fetchMovieDetails(event) {
    console.log(event.currentTarget.dataset.id)
    const imdbID = event.currentTarget.dataset.id;
    console.log('c.log rad 218, imdbID', imdbID);
    const searchResultsRef = document.querySelector('#searchResults');
    searchResultsRef.classList.add('d-none')
    const movieDetSect = document.querySelector('#movieDetails');
    movieDetSect.classList.remove('d-none');
    const apiKey = '792523f7';
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&plot=full&i=${imdbID}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Här presenteras hämtad data i movieDetailsSection
    const movieTitle = document.createElement('h2');
    movieTitle.textContent = data.Title
    const moviePlot = document.createElement('p');
    moviePlot.textContent = data.Plot;
    const moviePoster = document.createElement('img');
    moviePoster.src = data.Poster;
    moviePoster.alt = data.Title;
    const movieGenre = document.createElement('p');
    movieGenre.textContent = `Genre: ${data.Genre}`;
    const movieEarnings = document.createElement('p');
    movieEarnings.textContent = `Box office: ${data.BoxOffice}`;
    const movieDirector = document.createElement('p');
    movieDirector.textContent = `Director: ${data.Director}`;

        
    // LÄGG TILL MER FILMDATA HÄR!! ***************************
        
    // Rensa tidigare innehåll i movieDetails-sektionen MEN INTE INNERHTML!!******
    movieDetSect .innerHTML = '';
    
    
    // Append children...
    movieDetSect.appendChild(movieTitle);
    movieDetSect.appendChild(movieDirector);
    movieDetSect.appendChild(moviePoster);
    movieDetSect.appendChild(movieGenre);
    movieDetSect.appendChild(moviePlot);
    movieDetSect.appendChild(movieEarnings);
    
    // LÄGG TILL MER FILMDATA HÄR!!

    console.log(data);
    // if (data.Response === 'True') {
    //     return data;
    // } else {
    //     throw new Error(data.Error);
    // }

    return data;
}


















// 

function showSearchResultsSection() {
    document.querySelector('#searchResults').classList.remove('d-none');
}



//    Eventlyssnare för specifik sökning på IMDb-ID vid klick på sökt film ******** DEN HÄR SKA NOG SKROTAS
//    Eventlyssnare för specifik sökning på IMDb-ID vid klick på sökt film ******** DEN HÄR SKA NOG SKROTAS
//    Ska förhoppningsvis lyssna på resultsListRef

// document.addEventListener('click', async (event) => {
    //     console.log('c.log rad 200 Klick på film')
    //     if (event.target.matches('.result')) {
        //         const imdbID = event.target.dataset.imdbID;
        //         try {
            //             const movieDetails = await fetchMovieDetails(imdbID);
            //             console.log('c.log rad 205', movieDetails);
            //             // Implementera logik för att visa detaljer om filmen, t.ex. i en modalfönster
            //         } catch (error) {
                //             console.log('c.log rad 209 ärror fätching filmdetaljer', error);
                //         }
                //     }
                // });
//    Eventlyssnare för specifik sökning på IMDb-ID vid klick på sökt film ******** DEN HÄR SKA NOG SKROTAS
//    Eventlyssnare för specifik sökning på IMDb-ID vid klick på sökt film ******** DEN HÄR SKA NOG SKROTAS




// function test(event) {
    //     console.log(event.currentTarget.dataset.id)
    //     // d-none på allt annat, hämta data från API, fem grejer...
    //     // 
    
    // }
    
    // om sökning görs på tomt inputfält, gör;
    //  const searchresultsRef = document.querySelector('#searchresults');
    //  searchresultsRef.classList.add('d-none');
    //  const trailerSectionRef = document.querySelector('#trailer-section');
//  trailerSectionRef.classList.remove('d-none');
//  const popMoviesSection = document.querySelector('#popMovies');
//  popMoviesSection.classList.remove('d-none');